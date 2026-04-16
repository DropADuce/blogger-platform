import { sessionsRepo } from '../../../repositories/sessions/sessions.repo';

interface IJWTService<T> {
  createAccessToken: Func<[], string>;
  createRefreshToken: Func<[deviceId: string], string>;
  decodeToken: Func<[token: string], Promise<T>>;
}

const getDates = async <T extends { iat: number; exp: number }>(
  refreshToken: string,
  decodeToken: IJWTService<T>['decodeToken']
) => {
  const tokenData = await decodeToken(refreshToken);

  return {
    lastActiveDate: new Date(tokenData.iat * 1_000),
    expirationDate: new Date(tokenData.exp * 1_000),
  };
};

const createSession = async <T extends { iat: number; exp: number }>(
  params: {
    ip: string;
    userId: string;
    deviceName: string;
  },
  JWTService: IJWTService<T>
) => {
  const deviceId = crypto.randomUUID();

  const accessToken = JWTService.createAccessToken();
  const refreshToken = JWTService.createRefreshToken(deviceId);

  const dates = await getDates(refreshToken, JWTService.decodeToken)

  await sessionsRepo.createSession({
    ...params,
    ...dates,
    deviceId,
    title: params.deviceName,
  });

  return {
    accessToken,
    refreshToken,
  };
};

const updateSession = async <T extends { iat: number; exp: number }>(
  params: { deviceId: string },
  JWTService: IJWTService<T>
) => {
  const accessToken = JWTService.createAccessToken();
  const refreshToken = JWTService.createRefreshToken(params.deviceId);

  const dates = await getDates(refreshToken, JWTService.decodeToken)

  await sessionsRepo.updateLastActiveDate({
    deviceId: params.deviceId,
    expDate: dates.expirationDate,
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
