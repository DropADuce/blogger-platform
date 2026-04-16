import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '../constants/http-statuses.constants';
import { JWTService } from '../../domain/auth/services/jwt.service';
import { sessionsQueryRepo } from '../../repositories/sessions/sessions.query-repo';
import { UnauthorizeError } from '../errors/unauthorize-error';
import { container } from '../../app/compose/root';
import { UsersQueryRepository } from '../../repositories/users/users.query-repo';

const usersQueryRepository = container.get(UsersQueryRepository);

export const withRefreshTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tokenData = await JWTService.verifyToken<{ deviceId: string }>(req.cookies.refreshToken);

    const session = await sessionsQueryRepo.getSessionByDeviceId(tokenData.deviceId);

    const user = await usersQueryRepository.findByID(session?.userId ?? '');

    if (!user) throw new UnauthorizeError();

    const isInvalidToken = await usersQueryRepository.isTokenInBlackLit(
      user.login || user.email,
      req.cookies.refreshToken
    );

    if (isInvalidToken) return res.sendStatus(HTTP_STATUS.UNAUTHORIZED);

    req.loginOrEmail = user.login || user.email;

    return next();
  } catch {
    return res.sendStatus(HTTP_STATUS.UNAUTHORIZED);
  }
};
