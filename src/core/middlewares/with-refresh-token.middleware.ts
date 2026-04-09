import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '../constants/http-statuses.constants';
import { usersQueryRepo } from '../../repositories/users/users.query-repo';
import { JWTService } from '../../domain/auth/services/jwt.service';
import { sessionsQueryRepo } from '../../repositories/sessions/sessions.query-repo';
import { UnauthorizeError } from '../errors/unauthorize-error';

export const withRefreshTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('кука', req.cookies.refreshToken);
    const tokenData = await JWTService.verifyToken<{ deviceId: string }>(req.cookies.refreshToken);

    console.log('Если кука пришла, то вот так: ', tokenData);

    const session = await sessionsQueryRepo.getSessionByDeviceId(tokenData.deviceId);

    const user = await usersQueryRepo.findByID(session?.userId ?? '');

    if (!user) throw new UnauthorizeError();

    const isInvalidToken = await usersQueryRepo.isTokenInBlackLit(
      user.login || user.email,
      req.cookies.refreshToken
    );

    if (isInvalidToken) return res.sendStatus(HTTP_STATUS.UNAUTHORIZED);

    return next();
  } catch {
    return res.sendStatus(HTTP_STATUS.UNAUTHORIZED);
  }
};
