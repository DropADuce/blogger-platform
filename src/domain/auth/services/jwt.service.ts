import jwt from 'jsonwebtoken';
import { SETTINGS } from '../../../core/settings/setting';

const createAccessToken = (loginOrEmail: string) =>
  jwt.sign({ loginOrEmail, jti: crypto.randomUUID() }, SETTINGS.JWT_SECRET, {
    expiresIn: `${SETTINGS.ACCESS_TOKEN_TIME} s`,
  });

const createRefreshToken = (deviceId: string) =>
  jwt.sign({ deviceId, jti: crypto.randomUUID() }, SETTINGS.JWT_SECRET, {
    expiresIn: `${SETTINGS.REFRESH_TOKEN_TIME} s`,
  });

const decodeToken = async <T>(token: string): Promise<T> =>
  jwt.decode(token) as T;

const verifyToken = async <T>(token: string): Promise<T> =>
  jwt.verify(token, SETTINGS.JWT_SECRET) as T;

export const JWTService = {
  createAccessToken,
  createRefreshToken,
  verifyToken,
  decodeToken,
};
