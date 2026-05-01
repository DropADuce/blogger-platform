import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

import { JWTService } from '../../domain/auth/services/jwt.service';

// TODO: Унести куда-нибудь в common схемы
const BearerTokenSchema = z.object({
  authorization: z
    .string()
    .regex(/^Bearer\s+.+$/, 'Invalid Authorization header'),
});

export const WithOptionalJwtTokenMiddleware = async (req: Request, res: Response, next: NextFunction) => {
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
    return next();
  }
}