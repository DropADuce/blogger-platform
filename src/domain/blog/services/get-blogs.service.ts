import { Request, Response } from 'express';
import { BlogsRepo } from '../repository/blogs.repo';
import { mapMongoIdToId } from '../../../core/lib/map-mongo-id-to-id';
import { HTTP_STATUS } from '../../../core/constants/http-statuses.constants';

export const getBlogsService = async (_: Request, res: Response) => {
  try {
    const blogs = await BlogsRepo.getAll();

    res.send(blogs.map(mapMongoIdToId));
  } catch {
    res.sendStatus(HTTP_STATUS.SERVER_ERROR);
  }
};
