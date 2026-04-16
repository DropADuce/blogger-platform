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
import { CommentDTO } from '../../../../domain/comment/schemas/comment.schema';
import { commentsQueryRepo } from '../../../../repositories/comments/comments.query-repo';
import { container } from '../../../compose/root';
import { CommentService } from '../../../../domain/comment/services/comment.service';
import { ResultStatus } from '../../../../core/result/result-code';
import { UsersQueryRepository } from '../../../../repositories/users/users.query-repo';

const postsService = container.get(PostsService);
const commentsService = container.get(CommentService);
const usersQueryRepository = container.get(UsersQueryRepository);

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

    const createPostResult = await postsService.createPost(req.body, blog);

    if (!createPostResult.data.id) res.sendStatus(HTTP_STATUS.BAD_REQUEST);

    const post = await postsQueryRepo.findByID(createPostResult.data.id);

    return res.status(HTTP_STATUS.CREATED).send(post);
  }
);

const updatePost = async (
  req: Request<{ id: string }, never, PostDTO>,
  res: Response
) => {
  try {
    const result = await postsService.updatePost(req.params.id, req.body);

    return result.status === ResultStatus.Success
      ? res.sendStatus(HTTP_STATUS.NO_CONTENT)
      : res.sendStatus(HTTP_STATUS.NOT_FOUND);
  } catch {
    res.sendStatus(HTTP_STATUS.SERVER_ERROR);
  }
};

const deletePost = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const success = await postsService.deletePost(req.params.id);

    return success
      ? res.sendStatus(HTTP_STATUS.NO_CONTENT)
      : res.sendStatus(HTTP_STATUS.NOT_FOUND);
  } catch {
    res.sendStatus(HTTP_STATUS.SERVER_ERROR);
  }
};

const getComments = withTryCatch(
  async (
    req: Request<
      { id: string },
      unknown,
      unknown,
      Partial<WithSortAndPagination>
    >,
    res: Response
  ) => {
    const postId = req.params.id;

    const params = WithSortAndPaginationSchema.parse(req.query);

    await postsQueryRepo.findByID(postId);

    const { comments, count } = await commentsQueryRepo.findBlogsByPostId(
      postId,
      buildQuery(params)
    );

    return res.send(
      createWithPaginationResult({
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
        items: comments,
        count,
      })
    );
  }
);

const addComment = withTryCatch(
  async (req: Request<{ id: string }, unknown, CommentDTO>, res: Response) => {
    const postId = req.params.id;

    await postsQueryRepo.findByID(postId);

    const user = await usersQueryRepository.findByTokenData(
      req.loginOrEmail ?? ''
    );

    const commentID = await commentsService.leaveCommentByPost(
      req.body,
      { userId: user.userId, userLogin: user.login },
      postId
    );

    const comment = await commentsQueryRepo.findById(commentID);

    return res.status(HTTP_STATUS.CREATED).send(comment);
  }
);

export const RouteHandler = {
  findPosts,
  findPostById,
  createPost,
  updatePost,
  deletePost,
  addComment,
  getComments,
};
