import { Router } from 'express';
import { basicAuthMiddleware } from '../../../core/middlewares/basic-auth-middleware';
import { dtoValidationMiddleware } from '../../../core/middlewares/dto-validation-middleware';
import { DtoSchema } from '../schemas/dto.schema';
import { getPostsService } from '../services/get-posts.service';
import { createPostService } from '../services/create-post.service';
import { getPostService } from '../services/get-post.service';
import { updatePostService } from '../services/update-post.service';
import { deletePostService } from '../services/delete-post.service';
import { idValidationMiddleware } from '../../../core/middlewares/id-validaton-middleware';
import { MongoIdSchema } from '../../../db/mongo/mongo-id.schema';

export const router = Router()
  .get('/', getPostsService)
  .get('/:id', idValidationMiddleware(MongoIdSchema), getPostService)
  .post(
    '/',
    basicAuthMiddleware,
    dtoValidationMiddleware(DtoSchema),
    createPostService
  )
  .put(
    '/:id',
    basicAuthMiddleware,
    idValidationMiddleware(MongoIdSchema),
    dtoValidationMiddleware(DtoSchema),
    updatePostService
  )
  .delete(
    '/:id',
    idValidationMiddleware(MongoIdSchema),
    basicAuthMiddleware,
    deletePostService
  );
