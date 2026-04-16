import { CommentDTO } from '../schemas/comment.schema';
import { ICommentatorInfo, ICommentViewModel } from '../types/comment.types';
import { CommentsRepository } from '../../../repositories/comments/comments.repo';
import { inject, injectable } from 'inversify';
import { Result } from '../../../core/result/result.types';
import { ResultStatus } from '../../../core/result/result-code';

@injectable()
export class CommentService {
  constructor(
    @inject(CommentsRepository)
    private readonly commentsRepository: CommentsRepository
  ) {}

  private checkAuthor(
    comment: { userLogin: string; userId: string },
    user: { login: string; userId: string }
  ): Result {
    return {
      status:
        comment.userLogin !== user.login || comment.userId !== user.userId
          ? ResultStatus.Forbidden
          : ResultStatus.Success,
      data: null,
      extensions: [],
    };
  }

  leaveComment(
    comment: CommentDTO,
    commentator: ICommentatorInfo,
  ) {
    return this.commentsRepository.createComment({
      ...comment,
      commentatorInfo: commentator,
      createdAt: new Date().toISOString(),
    });
  }

  leaveCommentByPost(
    comment: CommentDTO,
    commentator: ICommentatorInfo,
    postId: string
  ) {
    return this.commentsRepository.createComment({
      ...comment,
      commentatorInfo: commentator,
      postId,
      createdAt: new Date().toISOString(),
    });
  }

  async removeComment(
    comment: ICommentViewModel,
    user: { login: string; email: string; userId: string }
  ) {
    const checkAuthorResult = this.checkAuthor(comment.commentatorInfo, user);

    if (checkAuthorResult.status === ResultStatus.Success) {
      await this.commentsRepository.removeComment(comment.id);
    }

    return checkAuthorResult;
  }

  async updateComment(
    comment: ICommentViewModel,
    user: { login: string; email: string; userId: string },
    dto: CommentDTO
  ) {
    const checkAuthorResult = this.checkAuthor(comment.commentatorInfo, user);

    if (checkAuthorResult.status === ResultStatus.Success) {
      await this.commentsRepository.updateComment(comment.id, dto)
    }

    return checkAuthorResult;
  }

  async removeCommentByPost(postId: string) {
    return await this.commentsRepository.removeAllCommentsByPost(postId);
  }
}
