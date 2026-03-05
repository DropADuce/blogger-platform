import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../../../core/constants/http-statuses.constants';
import { BlogsService } from '../../../../domain/blog/services/blogs.service';
import { PostsService } from '../../../../domain/post/services/posts.service';
import { BlogDTO } from '../../../../domain/blog/schemas/dto.schema';
import { CreatePostDTO } from '../../../../domain/post/schemas/dto.schema';
import { withTryCatch } from '../../../../core/lib/with-try-catch';
import {
  WithFilterAndSortAndPagination,
  WithFilterAndSortAndPaginationSchema,
} from '../../../../domain/blog/schemas/query-params.schema';
import { blogsQueryRepo } from '../../../../repositories/blogs/blogs.query-repo';
import { NotFoundError } from '../../../../core/errors/not-found.error';
import { postsQueryRepo } from '../../../../repositories/posts/posts.query-repo';
import {
  buildFilter,
  buildQuery,
} from '../../../../core/lib/build-mongo-query';
import { createWithPaginationResult } from '../../../../core/lib/create-with-paginatoin-result';
import {
  WithSortAndPagination,
  WithSortAndPaginationSchema,
} from '../../../../core/schemas/query-params.schema';

const findBlogs = withTryCatch(
  async (
    req: Request<unknown, unknown, unknown, WithFilterAndSortAndPagination>,
    res: Response
  ) => {
    const params = WithFilterAndSortAndPaginationSchema.parse(req.query);

    const result = await blogsQueryRepo
      .getAll(
        buildQuery(params, buildFilter([['name', params.searchNameTerm]]))
      )
      .then(({ blogs, pagesCount }) =>
        createWithPaginationResult({
          pageNumber: params.pageNumber,
          pageSize: params.pageSize,
          items: blogs,
          count: pagesCount,
        })
      );

    res.send(result);
  }
);

const findBlogById = withTryCatch(
  async (req: Request<{ id: string }>, res: Response) => {
    const blog = await blogsQueryRepo.findByID(req.params.id);

    return res.send(blog);
  }
);

const findPostsByBlogId = withTryCatch(
  async (
    req: Request<{ id: string }, unknown, unknown, WithSortAndPagination>,
    res: Response
  ) => {
    const params = WithSortAndPaginationSchema.parse(req.query);

    await blogsQueryRepo.findByID(req.params.id);

    const result = await postsQueryRepo
      .getAll(buildQuery(params, buildFilter([['blogId', req.params.id]])))
      .then(({ posts, count }) =>
        createWithPaginationResult({
          pageSize: params.pageSize,
          pageNumber: params.pageNumber,
          count,
          items: posts,
        })
      );

    return res.send(result);
  }
);

const createBlog = withTryCatch(
  async (req: Request<unknown, unknown, BlogDTO>, res) => {
    const id = await BlogsService.createBlog(req.body);

    const blog = await blogsQueryRepo.findByID(id);

    return res.status(HTTP_STATUS.CREATED).send(blog);
  }
);

const createPostByBlogId = withTryCatch(
  async (
    req: Request<{ id: string }, unknown, CreatePostDTO>,
    res: Response
  ) => {
    const blog = await blogsQueryRepo.findByID(req.params.id);

    if (!blog)
      throw new NotFoundError(
        `Блог с id ${req.params.id} - на найден`,
        'post /blog:/{blogID}/post'
      );

    const postID = await PostsService.createPost(req.body, blog);

    const post = await postsQueryRepo.findByID(postID);

    return res.status(HTTP_STATUS.CREATED).send(post);
  }
);

const updateBlog = withTryCatch(
  async (req: Request<{ id: string }, unknown, BlogDTO>, res: Response) => {
    await BlogsService.updateBlog(req.params.id, req.body);

    const blog = await blogsQueryRepo.findByID(req.params.id);

    return res.status(HTTP_STATUS.NO_CONTENT).send(blog);
  }
);

const deleteBlog = withTryCatch(
  async (req: Request<{ id: string }>, res: Response) => {
    const blog = await blogsQueryRepo.findByID(req.params.id);

    await BlogsService.deleteBlog(blog.id);

    return res.sendStatus(HTTP_STATUS.NO_CONTENT);
  }
);

export const RouteHandler = {
  findBlogs,
  findBlogById,
  findPostsByBlogId,
  createBlog,
  createPostByBlogId,
  updateBlog,
  deleteBlog,
};
