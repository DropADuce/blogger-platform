import { Request, Response } from 'express';
import { BlogsRepo } from '../repository/blogs.repo';
import { HTTP_STATUS } from '../../../core/constants/http-statuses.constants';

export const deleteBlogService = (req: Request, res: Response) => {
  const deleted = BlogsRepo.remove(String(req.params.id));

  return deleted
    ? res.sendStatus(HTTP_STATUS.NO_CONTENT)
    : res.sendStatus(HTTP_STATUS.NOT_FOUND);
};