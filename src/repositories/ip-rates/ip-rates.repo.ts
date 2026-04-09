import { ipRates } from '../../db/mongo/mongo.db';
import { IIPRate } from '../../domain/ip-rates/rate.types';

const addRate = (rate: IIPRate) => ipRates.insertOne(rate);

const removeAll = () => ipRates.deleteMany();

export const ipRatesRepo = {
  addRate,
  removeAll,
};
