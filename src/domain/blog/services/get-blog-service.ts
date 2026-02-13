import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../../core/constants/http-statuses.constants';
import { BlogsRepo } from '../repository/blogs.repo';
import { mapMongoIdToId } from '../../../core/lib/map-mongo-id-to-id';
import { createId } from '../../../core/lib/create-id';

export const getBlogService = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const blog = await BlogsRepo.findByID(createId(req.params.id));



    return blog
      ? res.send(mapMongoIdToId(blog))
      : res.sendStatus(HTTP_STATUS.NOT_FOUND);
  } catch {
    res.sendStatus(HTTP_STATUS.SERVER_ERROR);
  }
};
