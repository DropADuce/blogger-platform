import { Request, Response } from 'express';
import { PostsRepo } from '../repository/posts.repo';
import { HTTP_STATUS } from '../../../core/constants/http-statuses.constants';
import { mapMongoIdToId } from '../../../core/lib/map-mongo-id-to-id';
import { IPostWithBlogName } from '../types/post.types';
import { createId } from '../../../core/lib/create-id';
import { BlogsRepo } from '../../blog/repository/blogs.repo';

export const getPostsService = async (
  _: Request,
  res: Response<Array<IPostWithBlogName>>
) => {
  try {
    const posts = await PostsRepo.getAll();

    const blogIDS = [...new Set(posts.map((post) => post.blogId))].map(
      createId
    );

    const blogs = await BlogsRepo.findManyByID(blogIDS);

    const blogMap = new Map(
      blogs.map((blog) => [mapMongoIdToId(blog).id, blog.name])
    );

    const result = posts.map((post) => ({
      ...mapMongoIdToId(post),
      blogName: blogMap.get(post.blogId) ?? '',
    }));

    return res.send(result);
  } catch {
    res.sendStatus(HTTP_STATUS.SERVER_ERROR);
  }
};
