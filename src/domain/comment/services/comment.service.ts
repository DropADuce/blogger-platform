import { CommentDTO } from '../schemas/comment.schema';
import { ICommentatorInfo, ICommentViewModel } from '../types/comment.types';
import { commentsRepo } from '../../../repositories/comments/comments.repo';
import { ForbiddenError } from '../../../core/errors/forbidden-error';

const checkAuthor = (
  comment: { userLogin: string; userId: string },
  user: { login: string; userId: string }
) => {
  if (
    comment.userLogin !== user.login ||
    comment.userId !== user.userId
  )
    throw new ForbiddenError();
};

const leaveComment = async (
  comment: CommentDTO,
  commentator: ICommentatorInfo
) =>
  await commentsRepo.create({
    ...comment,
    commentatorInfo: commentator,
    createdAt: new Date().toISOString(),
  });

const leaveCommentByPost = async (
  comment: CommentDTO,
  commentator: ICommentatorInfo,
  postId: string
) =>
  commentsRepo.create({
    ...comment,
    commentatorInfo: commentator,
    postId,
    createdAt: new Date().toISOString(),
  });

const removeComment = async (
  comment: ICommentViewModel,
  user: { login: string; email: string; userId: string }
) => {
  checkAuthor(comment.commentatorInfo, user);

  return await commentsRepo.remove(comment.id);
};

const updateComment = async (
  comment: ICommentViewModel,
  user: { login: string; email: string; userId: string },
  dto: CommentDTO,
) => {
  checkAuthor(comment.commentatorInfo, user);

  return await commentsRepo.update(comment.id, dto);
};

const removeCommentByPost = async (postId: string) => {
  return await commentsRepo.removeAllByPost(postId);
};

export const commentsService = {
  leaveComment,
  leaveCommentByPost,
  updateComment,
  removeComment,
  removeCommentByPost,
};
