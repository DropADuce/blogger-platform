import { Request, Response } from 'express';
import { PostsRepo } from '../repository/posts.repo';
import { HTTP_STATUS } from '../../../core/constants/http-statuses.constants';
import { PostDTO } from '../schemas/dto.schema';
import { createId } from '../../../core/lib/create-id';

export const updatePostService = async (
  req: Request<{ id: string }, never, PostDTO>,
  res: Response
) => {
  try {
    const id = createId(req.params.id);
    const post = req.body;

    const result = await PostsRepo.replace(id, post);

    return result.modifiedCount
      ? res.sendStatus(HTTP_STATUS.NO_CONTENT)
      : res.sendStatus(HTTP_STATUS.NOT_FOUND);
  } catch {
    res.status(HTTP_STATUS.SERVER_ERROR);
  }
};
