import { Router } from 'express';
import { dtoValidationMiddleware } from '../../../../core/middlewares/dto-validation-middleware';
import { UserDTOSchema } from '../../../../domain/user/schemas/user.schema';
import { routeHandler } from './route.handler';
import { basicAuthMiddleware } from '../../../../core/middlewares/basic-auth-middleware';

export const router = Router();

router
  .get('/', basicAuthMiddleware, routeHandler.getAll)
  .post('/', basicAuthMiddleware, dtoValidationMiddleware(UserDTOSchema), routeHandler.create)
  .delete('/:id', basicAuthMiddleware, routeHandler.remove);
