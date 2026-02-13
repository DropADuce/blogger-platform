import { Request, Response } from 'express';
import { PostsRepo } from '../repository/posts.repo';
import { HTTP_STATUS } from '../../../core/constants/http-statuses.constants';
import { createId } from '../../../core/lib/create-id';
import { mapMongoIdToId } from '../../../core/lib/map-mongo-id-to-id';
import { IPostWithBlogName } from '../types/post.types';
import { BlogsRepo } from '../../blog/repository/blogs.repo';

export const getPostService = async (
  req: Request<{ id: string }>,
  res: Response<IPostWithBlogName>
) => {
  try {
    const post = await PostsRepo.findByID(createId(req.params.id));

    if (!post) return res.sendStatus(HTTP_STATUS.NOT_FOUND);

    const blog = await BlogsRepo.findByID(createId(post.blogId));

    return post
      ? res.send(mapMongoIdToId({ ...post, blogName: blog?.name ?? '' }))
      : res.sendStatus(HTTP_STATUS.NOT_FOUND);
  } catch {
    res.sendStatus(HTTP_STATUS.SERVER_ERROR);
  }
};
