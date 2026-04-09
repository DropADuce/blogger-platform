import { addSeconds } from 'date-fns';

import { sessionsRepo } from '../../../repositories/sessions/sessions.repo';
import { SETTINGS } from '../../../core/settings/setting';

const createSession = async (
  params: {
    ip: string;
    userId: string;
    deviceName: string;
  },
  tokenCreators: {
    createAccessToken: Func<[], string>;
    createRefreshToken: Func<[deviceId: string], string>;
  }
) => {
  const now = new Date();

  const deviceId = crypto.randomUUID();

  const accessToken = tokenCreators.createAccessToken();
  const refreshToken = tokenCreators.createRefreshToken(deviceId);

  await sessionsRepo.createSession({
    ...params,
    deviceId,
    title: params.deviceName,
    lastActiveDate: now,
    expirationDate: addSeconds(now, SETTINGS.ACCESS_TOKEN_TIME),
  });

  return {
    accessToken,
    refreshToken,
  };
};

const updateSession = async (
  params: { deviceId: string },
  tokenCreators: {
    createAccessToken: Func<[], string>;
    createRefreshToken: Func<[deviceId: string], string>;
  }
) => {
  const accessToken = tokenCreators.createAccessToken();
  const refreshToken = tokenCreators.createRefreshToken(params.deviceId);

  await sessionsRepo.updateLastActiveDate({
    deviceId: params.deviceId,
    expDate: addSeconds(new Date(), SETTINGS.REFRESH_TOKEN_TIME),
  });

  return {
    accessToken,
    refreshToken,
  };
};

const removeOtherSessions = (params: { userId: string; deviceId: string }) =>
  sessionsRepo.removeOtherSessions(params.userId, params.deviceId);

const removeCurrentSession = (params: { deviceId: string }) =>
  sessionsRepo.removeCurrentSession(params.deviceId);

export const sessionsService = {
  createSession,
  updateSession,
  removeOtherSessions,
  removeCurrentSession,
};
