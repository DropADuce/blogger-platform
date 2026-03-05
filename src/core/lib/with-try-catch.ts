import { Request, Response } from 'express';
import { errorHandler } from '../errors/error-handler';

type BaseRequest = Request<unknown, unknown, unknown, unknown>;

type Handler<Req extends BaseRequest> = Func<
  [req: Req, res: Response],
  Promise<unknown>
>;

export const withTryCatch =
  <Req extends BaseRequest>(handler: Handler<Req>) =>
  async (req: Req, res: Response): Promise<void> => {
    try {
      await handler(req, res);
    } catch (error: unknown) {
      errorHandler(error, res);
    }
  };
