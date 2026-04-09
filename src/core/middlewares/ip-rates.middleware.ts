import { Request, Response, NextFunction } from 'express';
import { subSeconds } from 'date-fns';

import { IpRatesQueryRepo } from '../../repositories/ip-rates/ip-rates.query-repo';
import { HTTP_STATUS } from '../constants/http-statuses.constants';
import { ipRatesRepo } from '../../repositories/ip-rates/ip-rates.repo';

const DATE_INTERVAL = 10;
const REQUESTS_PORTION = 4;

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
      date: dateInterval.toISOString(),
    });

    if (lastRequestsCount >= REQUESTS_PORTION)
      return res.sendStatus(HTTP_STATUS.TOO_MANY);

    await ipRatesRepo.addRate({ ip, date: new Date().toISOString(), URL: url });

    return next();
  } catch {
    return res.sendStatus(HTTP_STATUS.BAD_REQUEST);
  }
};
