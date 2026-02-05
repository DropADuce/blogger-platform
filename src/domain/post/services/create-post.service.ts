import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../../core/constants/http-statuses.constants';
import { PostsRepo } from '../repository/posts.repo';
import { PostDTO } from '../schemas/dto.schema';
import { BlogsRepo } from '../../blog/repository/blogs.repo';
import { createId } from '../../../core/lib/create-id';
import { IPost } from '../types/post.types';

export const createPostService = (
  req: Request<never, never, PostDTO>,
  res: Response
) => {
  const post = req.body;
  const blog = BlogsRepo.findByID(req.body.blogId);

  const newPost: IPost = {
    id: createId(),
    ...post,
    blogName: blog?.name ?? '',
  };

  return res.status(HTTP_STATUS.CREATED).send(PostsRepo.create(newPost));
};
