import { Router } from 'express';
import { basicAuthMiddleware } from '../../../../core/middlewares/basic-auth-middleware';
import { dtoValidationMiddleware } from '../../../../core/middlewares/dto-validation-middleware';
import { DtoSchema } from '../../../../domain/post/schemas/dto.schema';
import { idValidationMiddleware } from '../../../../core/middlewares/id-validaton-middleware';
import { MongoIdSchema } from '../../../../db/mongo/mongo-id.schema';
import { RouteHandler } from './route.handler';
import { withJwtTokenMiddleware } from '../../../../core/middlewares/with-jwt-token.middleware';
import { CommentDTOSchema } from '../../../../domain/comment/schemas/comment.schema';

export const router = Router()
  .get('/', RouteHandler.findPosts)
  .get('/:id', idValidationMiddleware(MongoIdSchema), RouteHandler.findPostById)
  .get('/:id/comments', idValidationMiddleware(MongoIdSchema), RouteHandler.getComments)
  .post(
    '/',
    basicAuthMiddleware,
    dtoValidationMiddleware(DtoSchema),
    RouteHandler.createPost
  )
  .post(
    '/:id/comments',
    withJwtTokenMiddleware,
    idValidationMiddleware(MongoIdSchema),
    dtoValidationMiddleware(CommentDTOSchema),
    RouteHandler.addComment
  )
  .put(
    '/:id',
    basicAuthMiddleware,
    idValidationMiddleware(MongoIdSchema),
    dtoValidationMiddleware(DtoSchema),
    RouteHandler.updatePost
  )
  .delete(
    '/:id',
    idValidationMiddleware(MongoIdSchema),
    basicAuthMiddleware,
    RouteHandler.deletePost
  );
