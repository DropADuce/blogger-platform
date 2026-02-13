import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../../core/constants/http-statuses.constants';
import { PostsRepo } from '../repository/posts.repo';
import { PostDTO } from '../schemas/dto.schema';
import { BlogsRepo } from '../../blog/repository/blogs.repo';
import { createId } from '../../../core/lib/create-id';
import { IPost, IPostWithBlogName } from '../types/post.types';
import { mapMongoIdToId } from '../../../core/lib/map-mongo-id-to-id';

export const createPostService = async (
  req: Request<never, never, PostDTO>,
  res: Response<IPostWithBlogName>
) => {
  try {
    const post = req.body;

    const newPost: IPost = {
      ...post,
      createdAt: new Date().toISOString(),
    };

    const result = await PostsRepo.create(newPost);

    const [blog, insertedPost] = await Promise.all([
      BlogsRepo.findByID(createId(req.body.blogId)),
      PostsRepo.findByID(result.insertedId),
    ]);

    return insertedPost
      ? res
          .status(HTTP_STATUS.CREATED)
          .send(mapMongoIdToId({ ...insertedPost, blogName: blog?.name ?? '' }))
      : res.sendStatus(HTTP_STATUS.SERVER_ERROR);
  } catch {
    res.sendStatus(HTTP_STATUS.SERVER_ERROR);
  }
};
