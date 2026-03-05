import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../../../core/constants/http-statuses.constants';
import { BlogsService } from '../../../../domain/blog/services/blogs.service';
import { PostsService } from '../../../../domain/post/services/posts.service';
import { BlogDTO } from '../../../../domain/blog/schemas/dto.schema';
import { PostWithoutBlogIdDTO } from '../../../../domain/post/schemas/dto.schema';
import { withTryCatch } from '../../../../core/lib/with-try-catch';
import { WithFilterAndSortAndPagination } from '../../../../domain/blog/schemas/query-params.schema';

const findBlogs = withTryCatch(
  async (
    req: Request<unknown, unknown, unknown, WithFilterAndSortAndPagination>,
    res: Response
  ) => {
    const blogs = await BlogsService.findBlogs(req.query);

    res.send(blogs);
  }
);

const findBlogById = withTryCatch(
  async (req: Request<{ id: string }>, res: Response) => {
    const blog = await BlogsService.findBlogById(req.params.id);

    return res.send(blog);
  }
);

const findPostsByBlogId = withTryCatch(
  async (req: Request<{ id: string }>, res: Response) => {
    const posts = await PostsService.findPostsByBlogID(
      req.params.id,
      req.query
    );

    return res.send(posts);
  }
);

const createBlog = withTryCatch(
  async (req: Request<unknown, unknown, BlogDTO>, res) => {
    const blog = await BlogsService.createBlog(req.body);

    return res.status(HTTP_STATUS.CREATED).send(blog);
  }
);

const createPostByBlogId = withTryCatch(
  async (
    req: Request<{ id: string }, unknown, PostWithoutBlogIdDTO>,
    res: Response
  ) => {
    const post = await PostsService.createPost({
      ...req.body,
      blogId: req.params.id,
    });

    return res.status(HTTP_STATUS.CREATED).send(post);
  }
);

const updateBlog = withTryCatch(
  async (req: Request<{ id: string }, unknown, BlogDTO>, res: Response) => {
    const blog = await BlogsService.updateBlog(req.params.id, req.body);

    return res.status(HTTP_STATUS.NO_CONTENT).send(blog);
  }
);

const deleteBlog = withTryCatch(async (req: Request<{ id: string }>, res: Response) => {
    await BlogsService.deleteBlog(req.params.id);

    return res.sendStatus(HTTP_STATUS.NO_CONTENT)
});

export const RouteHandler = {
  findBlogs,
  findBlogById,
  findPostsByBlogId,
  createBlog,
  createPostByBlogId,
  updateBlog,
  deleteBlog,
};
