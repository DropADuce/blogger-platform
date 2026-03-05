import { Request, Response } from 'express';
import { withTryCatch } from '../../../core/lib/with-try-catch';
import { LoginDTO } from '../../../domain/auth/models/login.schema';
import { loginService } from '../../../domain/auth/services/login.service';
import { HTTP_STATUS } from '../../../core/constants/http-statuses.constants';

const login = withTryCatch(
  async (req: Request<unknown, unknown, LoginDTO>, res: Response) => {
    await loginService.login(req.body);

    return res.sendStatus(HTTP_STATUS.NO_CONTENT);
  }
);

export const routeHandler = {
  login
}