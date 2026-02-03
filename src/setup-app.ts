import express, { Express } from 'express';
import { router as blogsRouter } from './domain/blog/route/route';
import { router as testingRouter } from './domain/testing/route/route';

export const setupApp = (app: Express) => {
  app.use(express.json());

  app.use('/blogs', blogsRouter);
  app.use('/testing', testingRouter)
}