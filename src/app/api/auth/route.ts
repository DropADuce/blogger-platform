import { Router } from 'express';
import { dtoValidationMiddleware } from '../../../core/middlewares/dto-validation-middleware';
import { LoginDTOSchema } from '../../../domain/auth/models/login.schema';
import { routeHandler } from './route.handler';
import { withJwtTokenMiddleware } from '../../../core/middlewares/with-jwt-token.middleware';
import { UserDTOSchema } from '../../../domain/user/schemas/user.schema';
import { ConfirmEmailDTOSchema } from '../../../domain/auth/models/email-code.schema';
import { EmailDTOSchema } from '../../../domain/auth/models/email.schema';

export const router = Router();

router
  .get('/me', withJwtTokenMiddleware, routeHandler.me)
  .post('/login', dtoValidationMiddleware(LoginDTOSchema), routeHandler.login)
  .post('/refresh-token', routeHandler.updateTokens)
  .post(
    '/registration',
    dtoValidationMiddleware(UserDTOSchema),
    routeHandler.register
  )
  .post(
    '/registration-confirmation',
    dtoValidationMiddleware(ConfirmEmailDTOSchema),
    routeHandler.verify
  )
  .post(
    '/registration-email-resending',
    dtoValidationMiddleware(EmailDTOSchema),
    routeHandler.resendEmail
  ).post('/logout');
