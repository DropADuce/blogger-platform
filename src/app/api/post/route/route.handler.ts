import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../../../core/constants/http-statuses.constants';
import { PostsService } from '../../../../domain/post/services/posts.service';
import { PostDTO } from '../../../../domain/post/schemas/dto.schema';
import { withTryCatch } from '../../../../core/lib/with-try-catch';
import { postsQueryRepo } from '../../../../repositories/posts/posts.query-repo';
import {
  WithSortAndPagination,
  WithSortAndPaginationSchema,
} from '../../../../core/schemas/query-params.schema';
import { buildQuery } from '../../../../core/lib/build-mongo-query';
import { createWithPaginationResult } from '../../../../core/lib/create-with-paginatoin-result';
import { blogsQueryRepo } from '../../../../repositories/blogs/blogs.query-repo';

const findPosts = withTryCatch(
  async (
    req: Request<unknown, unknown, unknown, WithSortAndPagination>,
    res: Response
  ) => {
    const params = WithSortAndPaginationSchema.parse(req.query);

    const { posts, count } = await postsQueryRepo.getAll(buildQuery(params));

    return res.send(
      createWithPaginationResult({
        pageSize: params.pageSize,
        pageNumber: params.pageNumber,
        items: posts,
        count,
      })
    );
  }
);

const findPostById = withTryCatch(
  async (req: Request<{ id: string }>, res: Response) => {
    const post = await postsQueryRepo.findByID(req.params.id);

    return res.send(post);
  }
);

const createPost = withTryCatch(
  async (req: Request<unknown, unknown, PostDTO>, res: Response) => {
    const blog = await blogsQueryRepo.findByID(req.body.blogId);

    const postID = await PostsService.createPost(req.body, blog);

    const post = await postsQueryRepo.findByID(postID);

    return res.status(HTTP_STATUS.CREATED).send(post);
  }
);

const updatePost = async (
  req: Request<{ id: string }, never, PostDTO>,
  res: Response
) => {
  try {
    const success = await PostsService.updatePost(req.params.id, req.body);

    return success
      ? res.sendStatus(HTTP_STATUS.NO_CONTENT)
      : res.sendStatus(HTTP_STATUS.NOT_FOUND);
  } catch {
    res.sendStatus(HTTP_STATUS.SERVER_ERROR);
  }
};

const deletePost = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const success = await PostsService.deletePost(req.params.id);

    return success
      ? res.sendStatus(HTTP_STATUS.NO_CONTENT)
      : res.sendStatus(HTTP_STATUS.NOT_FOUND);
  } catch {
    res.sendStatus(HTTP_STATUS.SERVER_ERROR);
  }
};

export const RouteHandler = {
  findPosts,
  findPostById,
  createPost,
  updatePost,
  deletePost,
};
