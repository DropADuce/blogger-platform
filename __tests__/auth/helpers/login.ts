import { Express } from 'express';
import request from 'supertest';
import { HTTP_STATUS } from '../../../src/core/constants/http-statuses.constants';
import { LoginDTO } from '../../../src/domain/auth/models/login.schema';

const LOGIN_PAYLOAD_FALLBACK: LoginDTO = {
  loginOrEmail: 'Q54jAMzj4P',
  password: 'string',
};

export const login = (
  app: Express,
  credentials: Partial<LoginDTO> = LOGIN_PAYLOAD_FALLBACK
) =>
  request(app)
    .post('/auth/login')
    .send({ ...LOGIN_PAYLOAD_FALLBACK, ...credentials })
    .expect(HTTP_STATUS.OK);
