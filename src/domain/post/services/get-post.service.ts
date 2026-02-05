import { Request, Response } from 'express';
import { PostsRepo } from '../repository/posts.repo';
import { HTTP_STATUS } from '../../../core/constants/http-statuses.constants';

export const getPostService = (req: Request, res: Response) => {
  const post = PostsRepo.findByID(String(req.params.id));

  return post ? res.send(post) : res.sendStatus(HTTP_STATUS.NOT_FOUND);
};