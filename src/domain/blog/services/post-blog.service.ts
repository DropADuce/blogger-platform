import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../../core/constants/http-statuses.constants';
import { BlogsRepo } from '../repository/blogs.repo';
import { BlogDTO } from '../schemas/dto.schema';
import { IBlog } from '../types/blog.types';
import { mapMongoIdToId } from '../../../core/lib/map-mongo-id-to-id';

export const postBlogService = async (
  req: Request<never, never, BlogDTO>,
  res: Response
) => {
  try {
    const blog: IBlog = {
      ...req.body,
      isMembership: false,
      createdAt: new Date().toISOString(),
    };

    const result = await BlogsRepo.create(blog);

    const newBlog = await BlogsRepo.findByID(result.insertedId);

    return newBlog
      ? res.status(HTTP_STATUS.CREATED).send(mapMongoIdToId(newBlog))
      : res.sendStatus(HTTP_STATUS.BAD_REQUEST);
  } catch {
    res.sendStatus(HTTP_STATUS.SERVER_ERROR);
  }
};
