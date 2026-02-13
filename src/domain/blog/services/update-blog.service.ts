import { Request, Response } from 'express';
import { BlogsRepo } from '../repository/blogs.repo';
import { HTTP_STATUS } from '../../../core/constants/http-statuses.constants';
import { BlogDTO } from '../schemas/dto.schema';
import { createId } from '../../../core/lib/create-id';

export const updateBlogService = async (
  req: Request<{ id: string }, BlogDTO>,
  res: Response
) => {
  try {
    const result = await BlogsRepo.replace(createId(req.params.id), req.body);

    return result.matchedCount
      ? res.status(HTTP_STATUS.NO_CONTENT).send(req.body)
      : res.sendStatus(HTTP_STATUS.NOT_FOUND);
  } catch {
    res.sendStatus(HTTP_STATUS.SERVER_ERROR);
  }
};
