import { Request, Response } from 'express';

import { withTryCatch } from '../../../core/lib/with-try-catch';
import { sessionsQueryRepo } from '../../../repositories/sessions/sessions.query-repo';
import { usersQueryRepo } from '../../../repositories/users/users.query-repo';
import { UnauthorizeError } from '../../../core/errors/unauthorize-error';
import { JWTService } from '../../../domain/auth/services/jwt.service';
import { sessionsService } from '../../../domain/session/services/session.service';
import { HTTP_STATUS } from '../../../core/constants/http-statuses.constants';
import { ForbiddenError } from '../../../core/errors/forbidden-error';
import { NotFoundError } from '../../../core/errors/not-found.error';

const getActiveSessions = withTryCatch(async (req: Request, res: Response) => {
  const user = await usersQueryRepo.findByLoginOrEmail(req.loginOrEmail ?? '');

  if (!user) throw new UnauthorizeError();

  const sessions = await sessionsQueryRepo.getActiveDevicesByUser(user.id);

  res.send(sessions);
});

const removeOtherSessions = withTryCatch(
  async (req: Request, res: Response) => {
    const user = await usersQueryRepo.findByLoginOrEmail(
      req.loginOrEmail ?? ''
    );

    const tokenData = await JWTService.decodeToken<{ deviceId: string }>(
      req.cookies.refreshToken ?? ''
    );

    if (!tokenData.deviceId || !user?.id) throw new UnauthorizeError();

    await sessionsService.removeOtherSessions({
      deviceId: tokenData.deviceId,
      userId: user.id,
    });

    return res.sendStatus(HTTP_STATUS.NO_CONTENT);
  }
);

const removeCurrentSession = withTryCatch(
  async (req: Request<{ id: string }>, res: Response) => {
    const deviceId = req.params.id;

    const loginOrEmail = req.loginOrEmail ?? '';

    const user = await usersQueryRepo.findByLoginOrEmail(loginOrEmail);
    const session = await sessionsQueryRepo.getSessionByDeviceId(deviceId);

    if (!session)
      throw new NotFoundError(
        'Не найдено активной сессии для этого устройства',
        'remove current session'
      );

    if (session?.userId !== user?.id) throw new ForbiddenError();

    await sessionsService.removeCurrentSession({ deviceId });

    return res.sendStatus(HTTP_STATUS.NO_CONTENT);
  }
);

export const securityRoute = {
  getActiveSessions,
  removeOtherSessions,
  removeCurrentSession,
};
