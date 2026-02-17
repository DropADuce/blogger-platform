import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../../../core/constants/http-statuses.constants';
import { BlogsService } from '../../../../domain/blog/services/blogs.service';
import { PostsService } from '../../../../domain/post/services/posts.service';
import { BlogDTO } from '../../../../domain/blog/schemas/dto.schema';
import { WithFilterAndSortAndPagination } from '../../../../core/schemas/query-params.schema';
import { PostWithoutBlogIdDTO } from '../../../../domain/post/schemas/dto.schema';

const findBlogs = async (
  req: Request<never, never, never, WithFilterAndSortAndPagination>,
  res: Response
) => {
  try {
    const blogs = await BlogsService.findBlogs(req.query);

    res.send(blogs);
  } catch {
    res.sendStatus(HTTP_STATUS.SERVER_ERROR);
  }
};

const findBlogById = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const blog = await BlogsService.findBlogById(req.params.id);

    return blog ? res.send(blog) : res.sendStatus(HTTP_STATUS.NOT_FOUND);
  } catch {
    res.sendStatus(HTTP_STATUS.SERVER_ERROR);
  }
};

const findPostsByBlogId = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const blogs = await PostsService.findPostsByBlogID(
      req.params.id,
      req.query
    );

    return blogs ? res.send(blogs) : res.sendStatus(HTTP_STATUS.NOT_FOUND);
  } catch {
    res.sendStatus(HTTP_STATUS.NOT_FOUND);
  }
};

const createBlog = async (
  req: Request<never, never, BlogDTO>,
  res: Response
) => {
  try {
    const blog = await BlogsService.createBlog(req.body);

    return blog
      ? res.status(HTTP_STATUS.CREATED).send(blog)
      : res.sendStatus(HTTP_STATUS.NOT_FOUND);
  } catch {
    res.sendStatus(HTTP_STATUS.SERVER_ERROR);
  }
};

const createPostByBlogId = async (
  req: Request<{ id: string }, never, PostWithoutBlogIdDTO>,
  res: Response
) => {
  try {
    const post = await PostsService.createPost({
      ...req.body,
      blogId: req.params.id,
    });

    return post
      ? res.status(HTTP_STATUS.CREATED).send(post)
      : res.sendStatus(HTTP_STATUS.NOT_FOUND);
  } catch {
    res.sendStatus(HTTP_STATUS.SERVER_ERROR);
  }
};

const updateBlog = async (
  req: Request<{ id: string }, never, BlogDTO>,
  res: Response
) => {
  try {
    const blog = await BlogsService.updateBlog(req.params.id, req.body);

    return blog
      ? res.status(HTTP_STATUS.NO_CONTENT).send(blog)
      : res.sendStatus(HTTP_STATUS.NOT_FOUND);
  } catch {
    res.sendStatus(HTTP_STATUS.SERVER_ERROR);
  }
};

const deleteBlog = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const result = await BlogsService.deleteBlog(req.params.id);

    return result
      ? res.sendStatus(HTTP_STATUS.NO_CONTENT)
      : res.sendStatus(HTTP_STATUS.NOT_FOUND);
  } catch {
    res.sendStatus(HTTP_STATUS.SERVER_ERROR);
  }
};

export const RouteHandler = {
  findBlogs,
  findBlogById,
  findPostsByBlogId,
  createBlog,
  createPostByBlogId,
  updateBlog,
  deleteBlog,
};
