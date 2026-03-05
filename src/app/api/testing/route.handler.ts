import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../../core/constants/http-statuses.constants';
import { TestingService } from '../../../domain/testing/services/testing.service';

const clearDatabase = async (_: Request, res: Response) => {
  try {
    await TestingService.clearDatabase();

    res.sendStatus(HTTP_STATUS.NO_CONTENT);
  } catch {
    res.status(HTTP_STATUS.SERVER_ERROR);
  }
};

export const RouteHandler = {
  clearDatabase
}