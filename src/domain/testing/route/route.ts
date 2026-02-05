import { Request, Response, Router } from 'express';
import { TestingRepo } from '../repository/testing.repo';
import { HTTP_STATUS } from '../../../core/constants/http-statuses.constants';

export const router = Router();

router.delete('/all-data', (_: Request, res: Response) => {
  TestingRepo.removeAll();

  return res.sendStatus(HTTP_STATUS.NO_CONTENT)
})