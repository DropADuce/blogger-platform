import { Router } from 'express';
import { withJwtTokenMiddleware } from '../../../core/middlewares/with-jwt-token.middleware';
import { securityRoute } from './route.handler';
import { withRefreshTokenMiddleware } from '../../../core/middlewares/with-refresh-token.middleware';

export const router = Router()
  .get('/devices', withJwtTokenMiddleware, withRefreshTokenMiddleware, securityRoute.getActiveSessions)
  .delete(
    '/devices',
    withJwtTokenMiddleware,
    withRefreshTokenMiddleware,
    securityRoute.removeOtherSessions
  )
  .delete(
    '/devices/:id',
    withJwtTokenMiddleware,
    withRefreshTokenMiddleware,
    securityRoute.removeCurrentSession
  );
