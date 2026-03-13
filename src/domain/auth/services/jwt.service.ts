import jwt from 'jsonwebtoken';
import { SETTINGS } from '../../../core/settings/setting';

const createToken = async (loginOrEmail: string) =>
  jwt.sign({ loginOrEmail }, SETTINGS.JWT_SECRET, {
    expiresIn: SETTINGS.JWT_TIME,
  });

const decodeToken = async <T>(token: string): Promise<T> => (
  jwt.decode(token) as T
)

const verifyToken = async <T>(token: string): Promise<T> => (
  jwt.verify(token, SETTINGS.JWT_SECRET) as T
)

export const JWTService = {
  createToken,
  verifyToken,
  decodeToken,
};
