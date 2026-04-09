import { Router } from 'express';
import { securityRoute } from './route.handler';
import { withRefreshTokenMiddleware } from '../../../core/middlewares/with-refresh-token.middleware';

export const router = Router()
  .get('/devices', withRefreshTokenMiddleware, securityRoute.getActiveSessions)
  .delete(
    '/devices',
    withRefreshTokenMiddleware,
    securityRoute.removeOtherSessions
  )
  .delete(
    '/devices/:id',
    withRefreshTokenMiddleware,
    securityRoute.removeCurrentSession
  );
