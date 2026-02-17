import express from 'express';
import { startApp } from '../../src/app/app';

export const createTestApp = async () => {
  const app = express();

  await startApp(app);

  return app;
}