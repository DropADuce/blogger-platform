import { Request, Response } from 'express';
import { PostsRepo } from '../repository/posts.repo';
import { HTTP_STATUS } from '../../../core/constants/http-statuses.constants';
import { createId } from '../../../core/lib/create-id';

export const deletePostService = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const deleted = await PostsRepo.remove(createId(req.params.id));

    return deleted.deletedCount
      ? res.sendStatus(HTTP_STATUS.NO_CONTENT)
      : res.sendStatus(HTTP_STATUS.NOT_FOUND);
  } catch {
    res.sendStatus(HTTP_STATUS.SERVER_ERROR);
  }
};
