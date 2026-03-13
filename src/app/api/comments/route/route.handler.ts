import { Request, Response } from 'express';
import { withTryCatch } from '../../../../core/lib/with-try-catch';
import { commentsQueryRepo } from '../../../../repositories/comments/comments.query-repo';
import { usersQueryRepo } from '../../../../repositories/users/users.query-repo';
import { commentsService } from '../../../../domain/comment/services/comment.service';
import { HTTP_STATUS } from '../../../../core/constants/http-statuses.constants';
import { CommentDTO } from '../../../../domain/comment/schemas/comment.schema';

const getComments = withTryCatch(
  async (req: Request<{ id: string }>, res: Response) => {
    const comment = await commentsQueryRepo.findById(req.params.id);

    res.send(comment);
  }
);

const removeComment = withTryCatch(async (req: Request<{ id: string }>, res: Response) => {
  const user = await usersQueryRepo.findByTokenData(req.loginOrEmail ?? '');
  const comment = await commentsQueryRepo.findById(req.params.id);

  await commentsService.removeComment(comment, user);

  res.sendStatus(HTTP_STATUS.NO_CONTENT)
})

const updateComment = withTryCatch(async (req: Request<{ id: string }, unknown, CommentDTO>, res: Response) => {
  const user = await usersQueryRepo.findByTokenData(req.loginOrEmail ?? '');
  const comment = await commentsQueryRepo.findById(req.params.id);

  await commentsService.updateComment(comment, user, req.body);

  res.sendStatus(HTTP_STATUS.NO_CONTENT);
})

export const routeHandler = {
  getComments,
  updateComment,
  removeComment,
}
