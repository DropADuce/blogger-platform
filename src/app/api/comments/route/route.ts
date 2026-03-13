import { Router } from 'express';
import { idValidationMiddleware } from '../../../../core/middlewares/id-validaton-middleware';
import { withJwtTokenMiddleware } from '../../../../core/middlewares/with-jwt-token.middleware';
import { MongoIdSchema } from '../../../../db/mongo/mongo-id.schema';
import { routeHandler } from './route.handler';
import { dtoValidationMiddleware } from '../../../../core/middlewares/dto-validation-middleware';
import { CommentDTOSchema } from '../../../../domain/comment/schemas/comment.schema';

export const router = Router()
  .get('/:id', idValidationMiddleware(MongoIdSchema), routeHandler.getComments)
  .put(
    '/:id',
    withJwtTokenMiddleware,
    idValidationMiddleware(MongoIdSchema),
    dtoValidationMiddleware(CommentDTOSchema),
    routeHandler.updateComment
  )
  .delete(
    '/:id',
    idValidationMiddleware(MongoIdSchema),
    withJwtTokenMiddleware,
    routeHandler.removeComment
  );
