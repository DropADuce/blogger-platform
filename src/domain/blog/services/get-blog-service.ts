import { Request, Response } from 'express';
import { BlogsRepo } from '../repository/blogs.repo';
import { HTTP_STATUS } from '../../../core/constants/http-statuses.constants';

export const getBlogService = (req: Request, res: Response) => {
  const blog = BlogsRepo.findByID(String(req.params.id));

  return blog ? res.send(blog) : res.sendStatus(HTTP_STATUS.NOT_FOUND);
};