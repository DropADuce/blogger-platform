import { Request, Response } from 'express';

import { withTryCatch } from '../../../core/lib/with-try-catch';
import { LoginDTO } from '../../../domain/auth/models/login.schema';
import { loginService } from '../../../domain/auth/services/login.service';
import { JWTService } from '../../../domain/auth/services/jwt.service';
import { usersQueryRepo } from '../../../repositories/users/users.query-repo';
import { UserDTO } from '../../../domain/user/schemas/user.schema';
import { HTTP_STATUS } from '../../../core/constants/http-statuses.constants';
import { usersService } from '../../../domain/user/service/users.service';
import { emailService } from '../../../domain/auth/services/email.service';
import { ConfirmEmailDTO } from '../../../domain/auth/models/email-code.schema';
import { mapResultCodeToHttp } from '../../../core/result/map-result-code-to-http';
import { EmailDTO } from '../../../domain/auth/models/email.schema';

const me = withTryCatch(async (req, res) => {
  const user = await usersQueryRepo.findByTokenData(req.loginOrEmail ?? '');

  res.send(user);
});

const login = withTryCatch(
  async (req: Request<unknown, unknown, LoginDTO>, res: Response) => {
    await loginService.login(req.body);

    const accessToken = await JWTService.createToken(req.body.loginOrEmail);

    return res.send({ accessToken });
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
        .catch(() => {
          usersService.remove(user.insertedId.toString());
        });
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

    return res.sendStatus(HTTP_STATUS.NO_CONTENT)
  }
);

export const routeHandler = {
  me,
  login,
  register,
  verify,
  resendEmail,
};
