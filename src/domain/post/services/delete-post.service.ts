import { Request, Response } from 'express';
import { PostsRepo } from '../repository/posts.repo';
import { HTTP_STATUS } from '../../../core/constants/http-statuses.constants';

export const deletePostService = (req: Request, res: Response) => {
  const deleted = PostsRepo.remove(String(req.params.id));

  return deleted
    ? res.sendStatus(HTTP_STATUS.NO_CONTENT)
    : res.sendStatus(HTTP_STATUS.NOT_FOUND);
};