import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../../core/constants/http-statuses.constants';
import { BlogsRepo } from '../repository/blogs.repo';
import { IBlog } from '../types/blog.types';
import { createId } from '../../../core/lib/create-id';
import { BlogDTO } from '../schemas/dto.schema';

export const postBlogService = (
  req: Request<never, never, BlogDTO>,
  res: Response
) => {
  const blog: IBlog = { ...req.body, id: createId() };

  return res.status(HTTP_STATUS.CREATED).send(BlogsRepo.create(blog));
};
