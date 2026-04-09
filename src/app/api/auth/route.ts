import { Router } from 'express';

import { dtoValidationMiddleware } from '../../../core/middlewares/dto-validation-middleware';
import { LoginDTOSchema } from '../../../domain/auth/models/login.schema';
import { routeHandler } from './route.handler';
import { withJwtTokenMiddleware } from '../../../core/middlewares/with-jwt-token.middleware';
import { UserDTOSchema } from '../../../domain/user/schemas/user.schema';
import { ConfirmEmailDTOSchema } from '../../../domain/auth/models/email-code.schema';
import { EmailDTOSchema } from '../../../domain/auth/models/email.schema';
import { withRefreshTokenMiddleware } from '../../../core/middlewares/with-refresh-token.middleware';
import { ipRatesMiddleware } from '../../../core/middlewares/ip-rates.middleware';

export const router = Router();

router
  .get('/me', withJwtTokenMiddleware, routeHandler.me)
  .post('/login', ipRatesMiddleware, dtoValidationMiddleware(LoginDTOSchema), routeHandler.login)
  .post('/refresh-token', withRefreshTokenMiddleware, routeHandler.updateTokens)
  .post(
    '/registration',
    ipRatesMiddleware,
    dtoValidationMiddleware(UserDTOSchema),
    routeHandler.register
  )
  .post(
    '/registration-confirmation',
    ipRatesMiddleware,
    dtoValidationMiddleware(ConfirmEmailDTOSchema),
    routeHandler.verify
  )
  .post(
    '/registration-email-resending',
    ipRatesMiddleware,
    dtoValidationMiddleware(EmailDTOSchema),
    routeHandler.resendEmail
  )
  .post('/logout', withRefreshTokenMiddleware, routeHandler.logout);
