import { Response } from 'express';
import { NotFoundError } from './not-found.error';
import { HTTP_STATUS } from '../constants/http-statuses.constants';
import { BadRequestError } from './bad-request-error';
import { UnauthorizeError } from './unauthorize-error';

export const errorHandler = (error: unknown, res: Response) => {
  if (error instanceof NotFoundError) {
    const status = error.code;

    res.status(status).send({
      status: status,
      source: error.source,
      details: error.message,
    });
  }

  if (error instanceof BadRequestError) {
    res.status(error.code).send(error.body);
  }

  if (error instanceof UnauthorizeError) {
    res.sendStatus(error.code)
  }

  res.sendStatus(HTTP_STATUS.BAD_REQUEST);
};
