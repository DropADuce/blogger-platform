import { ipRates } from '../../db/mongo/mongo.db';

const getCountByIPAndURL = (params: { ip: string; url: string; date: string }) =>
  ipRates.countDocuments({
    ip: params.ip,
    URL: params.url,
    date: { $gt: params.date },
  });

export const IpRatesQueryRepo = {
  getCountByIPAndURL,
};
