import { Request, Response } from 'express';
import { BlogsRepo } from '../repository/blogs.repo';
import { HTTP_STATUS } from '../../../core/constants/http-statuses.constants';
import { BlogDTO } from '../schemas/dto.schema';
import { IBlog } from '../types/blog.types';

export const updateBlogService = (
  req: Request<{ id: string }, BlogDTO>,
  res: Response
) => {
  const id = req.params.id;

  const blog = BlogsRepo.findByID(id);

  if (!blog) return res.sendStatus(HTTP_STATUS.NOT_FOUND);

  const newBlog: IBlog = { ...blog, ...req.body };

  BlogsRepo.replace(newBlog);

  return res.sendStatus(HTTP_STATUS.NO_CONTENT);
};
