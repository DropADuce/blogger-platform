import express, { Express } from 'express';
import { router as blogsRouter } from './api/blog/route/route';
import { router as postsRouter } from './api/post/route/route';
import { router as testingRouter } from '../domain/testing/route/route';
import { runDB } from '../db/mongo/mongo.db';
import { noop } from '../core/lib/noop';
import { SETTINGS } from '../core/settings/setting';

const setupApp = (app: Express) => {
  app.use(express.json());

  app.use('/blogs', blogsRouter);
  app.use('/posts', postsRouter);
  app.use('/testing', testingRouter)
}

export const startApp = async (app: Express, startServer: () => void = noop) => {
  try {
    await runDB(SETTINGS.MONGO_URL);

    setupApp(app);
    startServer();
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
    }
  }
}