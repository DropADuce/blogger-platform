import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../../../core/constants/http-statuses.constants';
import { PostsService } from '../../../../domain/post/services/posts.service';
import { PostDTO } from '../../../../domain/post/schemas/dto.schema';

const findPosts = async (req: Request, res: Response) => {
  try {
    const posts = await PostsService.findPosts(req.query);

    return res.send(posts);
  } catch {
    res.sendStatus(HTTP_STATUS.SERVER_ERROR);
  }
};

const findPostById = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const post = await PostsService.findPostById(req.params.id);

    return post ? res.send(post) : res.sendStatus(HTTP_STATUS.NOT_FOUND);
  } catch {
    res.sendStatus(HTTP_STATUS.SERVER_ERROR);
  }
};

const createPost = async (
  req: Request<never, never, PostDTO>,
  res: Response
) => {
  try {
    const post = await PostsService.createPost(req.body);

    return post
      ? res.status(HTTP_STATUS.CREATED).send(post)
      : res.sendStatus(HTTP_STATUS.SERVER_ERROR);
  } catch {
    res.sendStatus(HTTP_STATUS.SERVER_ERROR);
  }
};

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
