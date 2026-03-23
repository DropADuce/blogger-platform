import dotenv from 'dotenv';

dotenv.config();

export const SETTINGS = {
  PORT: process.env.PORT || 5001,
  MONGO_URL: process.env.MONGO_DB_URL,
  DB_NAME: process.env.DB_NAME,
  JWT_SECRET: process.env.JWT_SECRET ?? '',
  JWT_TIME: Number(process.env.JWT_TIME ?? '300'),
  YA_TRANSPORT_EMAIL: process.env.YA_TRANSPORT_EMAIL ?? '',
  YA_TRANSPORT_PASSWORD: process.env.YA_TRANSPORT_PASSWORD ?? '',
};