import { Request, Response } from 'express';

import { withTryCatch } from '../../../core/lib/with-try-catch';
import { LoginDTO } from '../../../domain/auth/models/login.schema';
import { authService } from '../../../domain/auth/services/auth.service';
import { JWTService } from '../../../domain/auth/services/jwt.service';
import { usersQueryRepo } from '../../../repositories/users/users.query-repo';
import { UserDTO } from '../../../domain/user/schemas/user.schema';
import { HTTP_STATUS } from '../../../core/constants/http-statuses.constants';
import { usersService } from '../../../domain/user/service/users.service';
import { emailService } from '../../../domain/auth/services/email.service';
import { ConfirmEmailDTO } from '../../../domain/auth/models/email-code.schema';
import { mapResultCodeToHttp } from '../../../core/result/map-result-code-to-http';
import { EmailDTO } from '../../../domain/auth/models/email.schema';
import { sessionsService } from '../../../domain/session/services/session.service';
import { UnauthorizeError } from '../../../core/errors/unauthorize-error';
import { sessionsQueryRepo } from '../../../repositories/sessions/sessions.query-repo';

const me = withTryCatch(async (req, res) => {
  const user = await usersQueryRepo.findByTokenData(req.loginOrEmail ?? '');

  res.send(user);
});

const login = withTryCatch(
  async (req: Request<unknown, unknown, LoginDTO>, res: Response) => {
    await authService.login(req.body);

    const ip = req.ip;
    const user = await usersQueryRepo.findByLoginOrEmail(req.body.loginOrEmail);

    if (!ip || !user) throw new UnauthorizeError();

    const tokens = await sessionsService.createSession(
      {
        ip: ip,
        userId: user.id,
        deviceName: req.headers['user-agent'] ?? 'Неизвестное устройство',
      },
      {
        createAccessToken: () =>
          JWTService.createAccessToken(req.body.loginOrEmail),
        createRefreshToken: JWTService.createRefreshToken,
      }
    );

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
    });

    res.send({ accessToken: tokens.accessToken });
  }
);

const register = withTryCatch(
  async (req: Request<unknown, unknown, UserDTO>, res: Response) => {
    const user = await usersService.create(req.body);

    const confirmData = await usersQueryRepo.getEmailConfirmData(
      user.insertedId.toString()
    );

    if (confirmData) {
      await emailService
        .sendCode({ email: req.body.email, code: confirmData.code })
        // .catch(() => {
        //   usersService.remove(user.insertedId.toString());
        // });
    }

    return res.sendStatus(HTTP_STATUS.NO_CONTENT);
  }
);

const verify = withTryCatch(
  async (req: Request<unknown, unknown, ConfirmEmailDTO>, res: Response) => {
    const result = await emailService.verifyCode(req.body.code);

    const status = mapResultCodeToHttp(result.status);

    return res
      .status(status)
      .send(
        result.extensions.length
          ? { errorsMessages: result.extensions }
          : undefined
      );
  }
);

const resendEmail = withTryCatch(
  async (req: Request<unknown, unknown, EmailDTO>, res: Response) => {
    const confirmData = await usersQueryRepo.getIsConfirmed(req.body.email);

    if (!confirmData || confirmData.isConfirmed)
      return res.status(HTTP_STATUS.BAD_REQUEST).send({
        errorsMessages: [
          {
            field: 'email',
            message: 'Пользователь не найден, или подтвержден',
          },
        ],
      });

    await emailService.resendCode(confirmData.id, req.body.email);

    return res.sendStatus(HTTP_STATUS.NO_CONTENT);
  }
);

const updateTokens = withTryCatch(async (req, res) => {
  const token = req.cookies.refreshToken;

  const tokenData = await JWTService.decodeToken<{ deviceId: string }>(token);

  const sessionData = await sessionsQueryRepo.getSessionByDeviceId(tokenData.deviceId);

  const userData = await usersQueryRepo.findByID(sessionData?.userId ?? '');

  if (!sessionData || !userData) throw new UnauthorizeError();

  await authService.discardToken(userData.login, token);

  const tokens = await sessionsService.updateSession(
    { deviceId: tokenData.deviceId },
    {
      createAccessToken: () =>
        JWTService.createAccessToken(userData.login || userData.email),
      createRefreshToken: JWTService.createRefreshToken,
    }
  );

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: true,
  });

  return res.send({ accessToken: tokens.accessToken });
});

const logout = withTryCatch(async (req, res) => {
  const token = req.cookies.refreshToken;

  const loginOrEmail = req.loginOrEmail ?? '';

  const tokenData = await JWTService.verifyToken<{ deviceId: string }>(token);

  await authService.discardToken(loginOrEmail, token);

  await sessionsService.removeCurrentSession({ deviceId: tokenData.deviceId });

  res.sendStatus(HTTP_STATUS.NO_CONTENT);
});

export const routeHandler = {
  me,
  login,
  register,
  verify,
  resendEmail,
  updateTokens,
  logout,
};
