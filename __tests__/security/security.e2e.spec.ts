import express, { Express } from 'express';
import request, { Response } from 'supertest';

import { startApp } from '../../src/app/app';
import { HTTP_STATUS } from '../../src/core/constants/http-statuses.constants';
import { createUser } from '../user/helpers/create-user';
import { login } from '../auth/helpers/login';

const LOGIN = 'Batman';
const PASSWORD = 'Robin_123';

const getRefreshToken = (response: Response) => {
  const cookies = response.headers['set-cookie']![0];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, refreshTokenCookie] = cookies!.split('=');
  const [refreshToken] = refreshTokenCookie!.split(';');

  return refreshToken;
};

const loginUser = async (app: Express, userAgent: string) => {
  const response = await login(
    app,
    {
      loginOrEmail: LOGIN,
      password: PASSWORD,
    },
    userAgent
  );

  return {
    accessToken: response.body.accessToken,
    refreshToken: getRefreshToken(response),
  };
};

describe('/security', async () => {
  const app = express();

  await startApp(app);

  beforeEach(async () => {
    await request(app).delete('/testing/all-data');
  });

  describe('GET /security/devices', async () => {
    it('Получает список активных сессий', async () => {
      await createUser(app, {
        login: LOGIN,
        password: PASSWORD,
      }).expect(HTTP_STATUS.CREATED);

      const tokens_A = await loginUser(app, 'Chrome');
      await loginUser(app, 'Safari');
      const tokens_C = await loginUser(app, 'IOS Safari');
      await loginUser(app, 'Android Chrome');

      const updateResult = await request(app)
        .post('/auth/refresh-token')
        .set('Cookie', `refreshToken=${tokens_A.refreshToken}`)
        .expect(HTTP_STATUS.OK);

      const updatedAccessTokenA = updateResult.body.accessToken as string;
      const updatedRefreshTokenA = getRefreshToken(updateResult);

      const activeSessionsResponse = await request(app)
        .get('/security/devices')
        .set('Authorization', `Bearer ${updatedAccessTokenA}`)
        .set('Cookie', `refreshToken=${updatedRefreshTokenA}`)
        .expect(HTTP_STATUS.OK);

      expect(activeSessionsResponse.body).toBeInstanceOf(Array);
      expect(activeSessionsResponse.body.length).toBe(4);

      await request(app)
        .delete(`/security/devices/${activeSessionsResponse.body[1].deviceId}`)
        .set('Authorization', `Bearer ${updatedAccessTokenA}`)
        .set('Cookie', `refreshToken=${updatedRefreshTokenA}`)
        .expect(HTTP_STATUS.NO_CONTENT);

      const afterRemoveSecondDevice = await request(app)
        .get('/security/devices')
        .set('Authorization', `Bearer ${updatedAccessTokenA}`)
        .set('Cookie', `refreshToken=${updatedRefreshTokenA}`)
        .expect(HTTP_STATUS.OK);

      expect(afterRemoveSecondDevice.body.length).toBe(3);

      await request(app)
        .post('/auth/logout')
        .set('Cookie', `refreshToken=${tokens_C.refreshToken}`)
        .expect(HTTP_STATUS.NO_CONTENT);

      const afterLogout = await request(app)
        .get('/security/devices')
        .set('Authorization', `Bearer ${updatedAccessTokenA}`)
        .set('Cookie', `refreshToken=${updatedRefreshTokenA}`)
        .expect(HTTP_STATUS.OK);

      expect(afterLogout.body.length).toBe(2);

      await request(app)
        .delete(`/security/devices`)
        .set('Authorization', `Bearer ${updatedAccessTokenA}`)
        .set('Cookie', `refreshToken=${updatedRefreshTokenA}`)
        .expect(HTTP_STATUS.NO_CONTENT);

      const afterRemoveAll = await request(app)
        .get('/security/devices')
        .set('Authorization', `Bearer ${updatedAccessTokenA}`)
        .set('Cookie', `refreshToken=${updatedRefreshTokenA}`)
        .expect(HTTP_STATUS.OK);

      expect(afterRemoveAll.body.length).toBe(1);
    });
  });
});
