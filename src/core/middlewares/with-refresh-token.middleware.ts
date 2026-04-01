import { Request, Response, NextFunction } from 'express';
import { JWTService } from '../../domain/auth/services/jwt.service';
import { HTTP_STATUS } from '../constants/http-statuses.constants';
import { usersQueryRepo } from '../../repositories/users/users.query-repo';

export const withRefreshTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tokenData = await JWTService.verifyToken<{ loginOrEmail: string }>(
      req.cookies.refreshToken
    );

    req.loginOrEmail = tokenData.loginOrEmail;

    const isInvalidToken = await usersQueryRepo.isTokenInBlackLit(
      tokenData.loginOrEmail ?? '',
      req.cookies.refreshToken
    );

    if (isInvalidToken) return res.sendStatus(HTTP_STATUS.UNAUTHORIZED);

    return next();
  } catch {
    return res.sendStatus(HTTP_STATUS.UNAUTHORIZED);
  }
};
