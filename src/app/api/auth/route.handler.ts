import { Request, Response } from 'express';
import { withTryCatch } from '../../../core/lib/with-try-catch';
import { LoginDTO } from '../../../domain/auth/models/login.schema';
import { loginService } from '../../../domain/auth/services/login.service';
import { JWTService } from '../../../domain/auth/services/jwt.service';
import { usersQueryRepo } from '../../../repositories/users/users.query-repo';

const me = withTryCatch(async (req, res) => {
  const user = await usersQueryRepo.findByTokenData(req.loginOrEmail ?? '');

  res.send(user);
})

const login = withTryCatch(
  async (req: Request<unknown, unknown, LoginDTO>, res: Response) => {
    await loginService.login(req.body);

    const accessToken = await JWTService.createToken(req.body.loginOrEmail);

    return res.send({ accessToken });
  }
);

export const routeHandler = {
  me,
  login
}