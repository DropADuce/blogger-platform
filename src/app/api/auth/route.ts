import { Router } from 'express';
import { dtoValidationMiddleware } from '../../../core/middlewares/dto-validation-middleware';
import { LoginDTOSchema } from '../../../domain/auth/models/login.schema';
import { routeHandler } from './route.handler';
import { withJwtTokenMiddleware } from '../../../core/middlewares/with-jwt-token.middleware';

export const router = Router();

router
  .get('/me', withJwtTokenMiddleware, routeHandler.me)
  .post('/login', dtoValidationMiddleware(LoginDTOSchema), routeHandler.login);
