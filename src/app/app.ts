import express, { Express } from 'express';
import cookieParser from 'cookie-parser';

import { router as authRouter } from './api/auth/route';
import { router as blogsRouter } from './api/blog/route/route';
import { router as postsRouter } from './api/post/route/route';
import { router as usersRouter } from './api/user/route/route';
import { router as commentsRouter } from './api/comments/route/route';
import { router as testingRouter } from './api/testing/route';
import { runDB } from '../db/mongo/mongo.db';
import { noop } from '../core/lib/noop';
import { SETTINGS } from '../core/settings/setting';

const setupApp = (app: Express) => {
  app.use(cookieParser());
  app.use(express.json());

  app.use('/auth', authRouter);
  app.use('/blogs', blogsRouter);
  app.use('/posts', postsRouter);
  app.use('/users', usersRouter);
  app.use('/comments', commentsRouter)
  app.use('/testing', testingRouter);
};

export const startApp = async (
  app: Express,
  startServer: () => void = noop
) => {
  try {
    await runDB(SETTINGS.MONGO_URL);

    setupApp(app);

    startServer();
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
    }
  }
};
