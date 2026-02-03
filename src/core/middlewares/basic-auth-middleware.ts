import { NextFunction, Request, Response } from 'express';
import { HTTP_STATUS } from '../constants/http-statuses.constants';

const TOKEN = 'Basic'
const LOGIN = 'admin';
const PASSWORD = 'qwerty';

export const basicAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const [token, credentials64] = (req.headers.authorization ?? '').split(' ');

  try {
    const [login, password] = atob(credentials64 ?? '').split(':');

    if (token !== TOKEN || login !== LOGIN || password !== PASSWORD) throw new Error();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_: unknown) {
    return res.sendStatus(HTTP_STATUS.UNAUTHORIZED);
  }

  return next();
}