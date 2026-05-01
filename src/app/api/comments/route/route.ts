import { Router } from 'express';
import { idValidationMiddleware } from '../../../../core/middlewares/id-validaton-middleware';
import { withJwtTokenMiddleware } from '../../../../core/middlewares/with-jwt-token.middleware';
import { MongoIdSchema } from '../../../../db/mongo/mongo-id.schema';
import { routeHandler } from './route.handler';
import { dtoValidationMiddleware } from '../../../../core/middlewares/dto-validation-middleware';
import { CommentDTOSchema } from '../../../../domain/comment/schemas/comment.schema';
import { LikeStatusDtoSchema } from '../../../../domain/comment/schemas/like-status.dto.schema';
import { WithOptionalJwtTokenMiddleware } from '../../../../core/middlewares/with-optional-jwt-token.middleware';

export const router = Router()
  .get(
    '/:id',
    WithOptionalJwtTokenMiddleware,
    idValidationMiddleware(MongoIdSchema),
    routeHandler.getComments
  )
  .put(
    '/:id',
    withJwtTokenMiddleware,
    idValidationMiddleware(MongoIdSchema),
    dtoValidationMiddleware(CommentDTOSchema),
    routeHandler.updateComment
  )
  .put(
    '/:id/like-status',
    withJwtTokenMiddleware,
    idValidationMiddleware(MongoIdSchema),
    dtoValidationMiddleware(LikeStatusDtoSchema),
    routeHandler.addReaction
  )
  .delete(
    '/:id',
    idValidationMiddleware(MongoIdSchema),
    withJwtTokenMiddleware,
    routeHandler.removeComment
  );
