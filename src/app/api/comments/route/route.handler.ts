import { Request, Response } from 'express';
import { withTryCatch } from '../../../../core/lib/with-try-catch';
import { commentsQueryRepo } from '../../../../repositories/comments/comments.query-repo';
import { CommentService } from '../../../../domain/comment/services/comment.service';
import { HTTP_STATUS } from '../../../../core/constants/http-statuses.constants';
import { CommentDTO } from '../../../../domain/comment/schemas/comment.schema';
import { container } from '../../../compose/root';
import { ResultStatus } from '../../../../core/result/result-code';
import { mapResultCodeToHttp } from '../../../../core/result/map-result-code-to-http';
import { UsersQueryRepository } from '../../../../repositories/users/users.query-repo';

const commentsService = container.get(CommentService);
const usersQueryRepository = container.get(UsersQueryRepository);

const getComments = withTryCatch(
  async (req: Request<{ id: string }>, res: Response) => {
    const comment = await commentsQueryRepo.findById(req.params.id);

    res.send(comment);
  }
);

const removeComment = withTryCatch(
  async (req: Request<{ id: string }>, res: Response) => {
    const user = await usersQueryRepository.findByTokenData(req.loginOrEmail ?? '');
    const comment = await commentsQueryRepo.findById(req.params.id);

    const removeResult = await commentsService.removeComment(comment, user);

    if (removeResult.status === ResultStatus.Success)
      return res.sendStatus(HTTP_STATUS.NO_CONTENT);

    return res.sendStatus(mapResultCodeToHttp(removeResult.status));
  }
);

const updateComment = withTryCatch(
  async (req: Request<{ id: string }, unknown, CommentDTO>, res: Response) => {
    const user = await usersQueryRepository.findByTokenData(req.loginOrEmail ?? '');
    const comment = await commentsQueryRepo.findById(req.params.id);

    const updateResult = await commentsService.updateComment(
      comment,
      user,
      req.body
    );

    res.sendStatus(
      updateResult.status === ResultStatus.Success
        ? HTTP_STATUS.NO_CONTENT
        : mapResultCodeToHttp(updateResult.status)
    );
  }
);

export const routeHandler = {
  getComments,
  updateComment,
  removeComment,
};
