import { Request, Response } from 'express';
import { PostsRepo } from '../repository/posts.repo';
import { HTTP_STATUS } from '../../../core/constants/http-statuses.constants';
import { PostDTO } from '../schemas/dto.schema';
import { BlogsRepo } from '../../blog/repository/blogs.repo';
import { IPost } from '../types/post.types';

export const updatePostService = (
  req: Request<{ id: string }, never, PostDTO>,
  res: Response
) => {
  const id = req.params.id;
  const post = req.body;

  const blog = BlogsRepo.findByID(post.blogId);
  const oldPost = PostsRepo.findByID(id);

  if (!oldPost) return res.sendStatus(HTTP_STATUS.NOT_FOUND);

  const newPost: IPost = {
    ...oldPost,
    ...post,
    blogName: blog?.name ?? ''
  }

  PostsRepo.replace(newPost);

  return res.sendStatus(HTTP_STATUS.NO_CONTENT);
};
