import { CommentDTO } from '../schemas/comment.schema';
import { ICommentViewModel } from '../types/comment.types';
import { CommentsRepository } from '../../../repositories/comments/comments.repo';
import { inject, injectable } from 'inversify';
import { Result } from '../../../core/result/result.types';
import { ResultStatus } from '../../../core/result/result-code';
import { Comment, Commentator } from '../../../db/mongo/entities/comment/comment.model';

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

  // leaveComment(
  //   comment: CommentDTO,
  //   commentator: Commentator,
  // ) {
  //   return this.commentsRepository.createComment({
  //     ...comment,
  //     commentatorInfo: commentator,
  //   });
  // }

  leaveCommentByPost(
    comment: Comment,
    commentator: Commentator,
    postId: string
  ) {
    return this.commentsRepository.createComment({
      ...comment,
      commentatorInfo: commentator,
      postId,
    });
  }

  async removeComment(
    comment: { content: string; commentatorInfo: Commentator; id: string },
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
      await this.commentsRepository.updateComment(comment.id, dto);
    }

    return checkAuthorResult;
  }

  async removeCommentByPost(postId: string) {
    return await this.commentsRepository.removeAllCommentsByPost(postId);
  }
}
