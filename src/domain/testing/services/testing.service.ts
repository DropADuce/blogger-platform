import { Response } from 'express';
import { BlogsRepo } from '../../blog/repository/blogs.repo';
import { PostsRepo } from '../../post/repository/posts.repo';
import { HTTP_STATUS } from '../../../core/constants/http-statuses.constants';

export const removeAllService = async (_: unknown, res: Response) => {
  await Promise.allSettled([BlogsRepo.removeAll(), PostsRepo.removeAll()]);

  res.sendStatus(HTTP_STATUS.NO_CONTENT);
}