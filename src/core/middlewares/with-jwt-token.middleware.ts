import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '../constants/http-statuses.constants';
import { z } from 'zod';
import { JWTService } from '../../domain/auth/services/jwt.service';

const BearerTokenSchema = z.object({
  authorization: z
    .string()
    .regex(/^Bearer\s+.+$/, 'Invalid Authorization header'),
});

export const withJwtTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [, token] = BearerTokenSchema.parse(req.headers).authorization.split(
      ' '
    );

    const payload = await JWTService.verifyToken<{ loginOrEmail: string }>(
      token ?? ''
    );

    req.loginOrEmail = payload.loginOrEmail;

    return next();
  } catch {
    return res.sendStatus(HTTP_STATUS.UNAUTHORIZED);
  }
};
