import { sessions } from '../../db/mongo/mongo.db';
import { ISession } from '../../domain/session/types/session.types';

const createSession = (session: ISession) => sessions.insertOne(session);

const updateLastActiveDate = (params: { deviceId: string; expDate: Date }) =>
  sessions.updateOne(
    { deviceId: params.deviceId },
    { $set: { lastActiveDate: new Date(), expirationDate: params.expDate } }
  );

const removeCurrentSession = (deviceId: string) => sessions.deleteOne({ deviceId });

const removeOtherSessions = (userId: string, deviceId: string) =>
  sessions.deleteMany({ userId: userId, deviceId: { $ne: deviceId } });

const removeAll = () => sessions.deleteMany({});

export const sessionsRepo = {
  createSession,
  updateLastActiveDate,
  removeCurrentSession,
  removeOtherSessions,
  removeAll,
};
