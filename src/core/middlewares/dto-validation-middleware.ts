import { Request, Response, NextFunction } from 'express';
import { API_ERROR } from '../types/error.types';
import { HTTP_STATUS } from '../constants/http-statuses.constants';
import { ZodType } from 'zod';

// Не очень мне нравится, что обрбаотка ошибки получается не гибкой, но скорее всего этот вопрос решаем расширением типа Request и подкидыванием туда
export const dtoValidationMiddleware =
  (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (result.success) {
      req.body = result.data;

      return next();
    }

    const errors: API_ERROR = {
      errorsMessages: result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    };

    return res.status(HTTP_STATUS.BAD_REQUEST).json(errors);
  };
