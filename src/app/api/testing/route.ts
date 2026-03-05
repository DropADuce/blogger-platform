import { Router } from 'express';
import { RouteHandler } from './route.handler';

export const router = Router();

router.delete('/all-data', RouteHandler.clearDatabase)