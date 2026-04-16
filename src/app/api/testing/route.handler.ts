import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../../core/constants/http-statuses.constants';
import { TestingService } from '../../../domain/testing/services/testing.service';
import { container } from '../../compose/root';

const testingService = container.get(TestingService);

const clearDatabase = async (_: Request, res: Response) => {
  try {
    await testingService.clearDatabase();

    res.sendStatus(HTTP_STATUS.NO_CONTENT);
  } catch {
    res.status(HTTP_STATUS.SERVER_ERROR);
  }
};

export const RouteHandler = {
  clearDatabase
}