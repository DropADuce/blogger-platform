import { Router } from 'express';
import { basicAuthMiddleware } from '../../../../core/middlewares/basic-auth-middleware';
import { dtoValidationMiddleware } from '../../../../core/middlewares/dto-validation-middleware';
import { DtoSchema } from '../../../../domain/blog/schemas/dto.schema';
import { idValidationMiddleware } from '../../../../core/middlewares/id-validaton-middleware';
import { MongoIdSchema } from '../../../../db/mongo/mongo-id.schema';
import { RouteHandler } from './route.handler';
import { CreatePostByBlogDTOSchema } from '../../../../domain/post/schemas/dto.schema';

export const router = Router()
  .get('/', RouteHandler.findBlogs)
  .get('/:id', idValidationMiddleware(MongoIdSchema), RouteHandler.findBlogById)
  .get(
    '/:id/posts',
    idValidationMiddleware(MongoIdSchema),
    RouteHandler.findPostsByBlogId
  )
  .post(
    '/',
    basicAuthMiddleware,
    dtoValidationMiddleware(DtoSchema),
    RouteHandler.createBlog
  )
  .post(
    '/:id/posts',
    idValidationMiddleware(MongoIdSchema),
    basicAuthMiddleware,
    dtoValidationMiddleware(CreatePostByBlogDTOSchema),
    RouteHandler.createPostByBlogId
  )
  .put(
    '/:id',
    basicAuthMiddleware,
    idValidationMiddleware(MongoIdSchema),
    dtoValidationMiddleware(DtoSchema),
    RouteHandler.updateBlog
  )
  .delete(
    '/:id',
    basicAuthMiddleware,
    idValidationMiddleware(MongoIdSchema),
    RouteHandler.deleteBlog
  );
