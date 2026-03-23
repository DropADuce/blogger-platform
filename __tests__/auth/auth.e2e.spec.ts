import request from 'supertest';

import { createTestApp } from '../utils/create-test-app';
import { HTTP_STATUS } from '../../src/core/constants/http-statuses.constants';
import { createUser } from '../user/helpers/create-user';

describe('/auth', async () => {
  const app = await createTestApp();

  beforeEach(async () => {
    await request(app).delete('/testing/all-data');
  });

  describe('GET /me', () => {
    it('Без токена вернем 401', async () => {
      await request(app).get('/auth/me').expect(HTTP_STATUS.UNAUTHORIZED);
    });

    it('С невалидным токеном вернем 401', async () => {
      await request(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer some-invalid-token')
        .expect(HTTP_STATUS.UNAUTHORIZED);
    });

    it('С валидным токеном вернем пользователя', async () => {
      const user = await createUser(app);

      const loginResponse = await request(app)
        .post('/auth/login')
        .send({ loginOrEmail: user.body.login, password: 'string' })
        .expect(HTTP_STATUS.OK);

      const { accessToken } = loginResponse.body;

      const meResponse = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HTTP_STATUS.OK);

      expect(meResponse.body).toMatchObject({
        userId: expect.any(String),
        login: user.body.login,
        email: user.body.email,
      });
    })
  })

  describe('POST /login', () => {
    it('Без body вернет 400', async () => {
      await request(app).post('/auth/login').expect(HTTP_STATUS.BAD_REQUEST);
    });

    it('Если пользователь не существует - 401', async () => {
      await request(app)
        .post('/auth/login')
        .send({ loginOrEmail: '', password: '' })
        .expect(HTTP_STATUS.UNAUTHORIZED);
    });

    it('С неверным паролем - 401', async () => {
      await createUser(app);

      await request(app)
        .post('/auth/login')
        .send({ loginOrEmail: 'Q54jAMzj4P', password: 'string_1' })
        .expect(HTTP_STATUS.UNAUTHORIZED);
    });

    it('С верным паролем - 200', async () => {
      await createUser(app);

      const response = await request(app)
        .post('/auth/login')
        .send({ loginOrEmail: 'Q54jAMzj4P', password: 'string' })
        .expect(HTTP_STATUS.OK);

      expect(response.body.accessToken.split('.').length).toBe(3)
    });
  });

  describe('POST /auth/registration-confirmation', () => {

  });
});
