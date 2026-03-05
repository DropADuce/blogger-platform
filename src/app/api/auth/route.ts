import { Router } from 'express';
import { dtoValidationMiddleware } from '../../../core/middlewares/dto-validation-middleware';
import { LoginDTOSchema } from '../../../domain/auth/models/login.schema';
import { routeHandler } from './route.handler';

export const router = Router();

router.post(
  '/login',
  dtoValidationMiddleware(LoginDTOSchema),
  routeHandler.login
);
