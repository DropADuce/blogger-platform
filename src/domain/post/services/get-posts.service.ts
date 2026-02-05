import { Request, Response } from 'express';
import { PostsRepo } from '../repository/posts.repo';

export const getPostsService = (_: Request, res: Response) => {
  res.send(PostsRepo.getAll());
};