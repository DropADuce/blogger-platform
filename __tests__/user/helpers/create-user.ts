import { Express } from 'express';
import { UserDTO } from '../../../src/domain/user/schemas/user.schema';
import request from 'supertest';

const VALID_DTO = {
  login: 'Q54jAMzj4P',
  password: 'string',
  email: 'example@example.dev',
};

export const createUser = (app: Express, dto: Partial<UserDTO> = {}) => {
  return request(app)
    .post('/users')
    .auth('admin', 'qwerty')
    .send({ ...VALID_DTO, ...dto });
};
