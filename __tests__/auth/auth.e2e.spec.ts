import request from 'supertest';

import { createTestApp } from '../utils/create-test-app';
import { HTTP_STATUS } from '../../src/core/constants/http-statuses.constants';
import { createUser } from '../user/helpers/create-user';

describe('/auth', async () => {
  const app = await createTestApp();

  beforeEach(async () => {
    await request(app).delete('/testing/all-data');
  });

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

    it('С верным паролем - 201', async () => {
      await createUser(app);

      await request(app)
        .post('/auth/login')
        .send({ loginOrEmail: 'Q54jAMzj4P', password: 'string' })
        .expect(HTTP_STATUS.NO_CONTENT);
    });
  });
});
