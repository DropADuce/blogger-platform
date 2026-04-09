import { Request, Response, NextFunction } from 'express';
import { subSeconds } from 'date-fns';

import { IpRatesQueryRepo } from '../../repositories/ip-rates/ip-rates.query-repo';
import { HTTP_STATUS } from '../constants/http-statuses.constants';

const DATE_INTERVAL = 10;
const REQUESTS_PORTION = 5;

export const ipRatesMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ip = req.ip;
    const url = req.baseUrl || req.originalUrl;
    const dateInterval = subSeconds(new Date(), DATE_INTERVAL);

    if (!ip) return res.sendStatus(HTTP_STATUS.BAD_REQUEST);

    const lastRequestsCount = await IpRatesQueryRepo.getCountByIPAndURL({
      ip,
      url,
      date: dateInterval,
    });

    if (lastRequestsCount > REQUESTS_PORTION)
      return res.sendStatus(HTTP_STATUS.TOO_MANY);

    return next();
  } catch {
    return res.sendStatus(HTTP_STATUS.BAD_REQUEST);
  }
};
