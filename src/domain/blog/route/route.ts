import { Router } from 'express';
import { basicAuthMiddleware } from '../../../core/middlewares/basic-auth-middleware';
import { dtoValidationMiddleware } from '../../../core/middlewares/dto-validation-middleware';
import { DtoSchema } from '../schemas/dto.schema';
import { getBlogsService } from '../services/get-blogs.service';
import { postBlogService } from '../services/post-blog.service';
import { updateBlogService } from '../services/update-blog.service';
import { deleteBlogService } from '../services/delete-blog.service';
import { getBlogService } from '../services/get-blog-service';
import { idValidationMiddleware } from '../../../core/middlewares/id-validaton-middleware';
import { MongoIdSchema } from '../../../db/mongo/mongo-id.schema';

export const router = Router()
  .get('/', getBlogsService)
  .get('/:id', idValidationMiddleware(MongoIdSchema), getBlogService)
  .post(
    '/',
    basicAuthMiddleware,
    dtoValidationMiddleware(DtoSchema),
    postBlogService
  )
  .put(
    '/:id',
    basicAuthMiddleware,
    idValidationMiddleware(MongoIdSchema),
    dtoValidationMiddleware(DtoSchema),
    updateBlogService
  )
  .delete(
    '/:id',
    basicAuthMiddleware,
    idValidationMiddleware(MongoIdSchema),
    deleteBlogService
  );
