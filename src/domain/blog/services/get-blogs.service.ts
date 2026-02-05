import { Request, Response } from 'express';
import { BlogsRepo } from '../repository/blogs.repo';

export const getBlogsService = (_: Request, res: Response) => {
  res.send(BlogsRepo.getAll());
};