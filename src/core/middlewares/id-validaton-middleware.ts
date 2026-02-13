import { Request, Response, NextFunction } from 'express';
import { ZodType } from 'zod';
import { HTTP_STATUS } from '../constants/http-statuses.constants';

export const idValidationMiddleware =
  (schema: ZodType) =>
  (req: Request<{ id?: string }>, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params.id);

    if (result.success) return next();

    return res.sendStatus(HTTP_STATUS.NOT_FOUND);
  };
