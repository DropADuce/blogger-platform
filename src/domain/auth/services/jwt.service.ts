import jwt from 'jsonwebtoken';
import { SETTINGS } from '../../../core/settings/setting';

const createToken = async (loginOrEmail: string) =>
  Promise.all([
    jwt.sign({ loginOrEmail }, SETTINGS.JWT_SECRET, {
      expiresIn: `${SETTINGS.ACCESS_TOKEN_TIME} sec`,
    }),
    jwt.sign({ loginOrEmail }, SETTINGS.JWT_SECRET, {
      expiresIn: `${SETTINGS.REFRESH_TOKEN_TIME} s`,
    }),
  ]).then(([accessToken, refreshToken]) => ({ accessToken, refreshToken }));

const decodeToken = async <T>(token: string): Promise<T> =>
  jwt.decode(token) as T;

const verifyToken = async <T>(token: string): Promise<T> =>
  jwt.verify(token, SETTINGS.JWT_SECRET) as T;

export const JWTService = {
  createToken,
  verifyToken,
  decodeToken,
};
