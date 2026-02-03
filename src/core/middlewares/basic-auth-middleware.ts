import { NextFunction, Request, Response } from 'express';
import { HTTP_STATUS } from '../constants/http-statuses.constants';

const LOGIN = 'admin';
const PASSWORD = 'qwerty';

export const basicAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const [, credentials64] = (req.headers.authorization ?? '').split(' ');
  const [login, password] = atob(credentials64 ?? '').split(':');

  if (login !== LOGIN || password !== PASSWORD) return res.sendStatus(HTTP_STATUS.UNAUTHORIZED);

  return next();
}