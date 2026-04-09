import { ipRates } from '../../db/mongo/mongo.db';

const getCountByIPAndURL = (params: { ip: string; url: string; date: Date }) =>
  ipRates.countDocuments({
    ip: params.ip,
    url: params.url,
    date: { $gt: params.date },
  });

export const IpRatesQueryRepo = {
  getCountByIPAndURL,
};
