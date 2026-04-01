import { Request, Response, NextFunction } from 'express';
import { JWTService } from '../../domain/auth/services/jwt.service';
import { HTTP_STATUS } from '../constants/http-statuses.constants';

export const withRefreshTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tokenData = await JWTService.verifyToken<{ loginOrEmail: string }>(req.cookies.refreshToken);

    req.loginOrEmail = tokenData.loginOrEmail;

    return next();
  } catch {
    return res.sendStatus(HTTP_STATUS.UNAUTHORIZED);
  }
};
