import { Request, Response } from 'express';
import { BlogsRepo } from '../repository/blogs.repo';
import { HTTP_STATUS } from '../../../core/constants/http-statuses.constants';
import { createId } from '../../../core/lib/create-id';
import { PostsRepo } from '../../post/repository/posts.repo';
import { client } from '../../../db/mongo/mongo.db';

export const deleteBlogService = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const session = client.startSession();

  try {
    const result = await session.withTransaction(async () => {
      const deleteResult = await BlogsRepo.remove(createId(req.params.id), session);

      if (!deleteResult) return false;

      await PostsRepo.removeAllByBlog(req.params.id, session);

      return true;
    });

    await session.endSession();

    return result
      ? res.sendStatus(HTTP_STATUS.NO_CONTENT)
      : res.sendStatus(HTTP_STATUS.NOT_FOUND);
  } catch {
    await session.endSession();
    return res.sendStatus(HTTP_STATUS.SERVER_ERROR);
  }
};
