import { sessions } from '../../db/mongo/mongo.db';
import { ISession } from '../../domain/session/types/session.types';
import { mapMongoIdToId } from '../../core/lib/map-mongo-id-to-id';

interface IDeviceInfo {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;
}

const mapSessionToDeviceInfo = (sessionItem: ISession): IDeviceInfo => ({
  ip: sessionItem.ip,
  title: sessionItem.title,
  lastActiveDate: sessionItem.lastActiveDate.toISOString(),
  deviceId: sessionItem.deviceId,
});

const getActiveDevicesByUser = async (userId: string) => {
  const activeDevices = await sessions
    .find({
      userId,
      expirationDate: { $gte: new Date() },
    })
    .toArray();

  return activeDevices.map(mapSessionToDeviceInfo);
};

const getSessionByDeviceId = async (deviceId: string) => {
  const info = await sessions.findOne({ deviceId });

  return info ? mapMongoIdToId(info) : null;
};

export const sessionsQueryRepo = {
  getSessionByDeviceId,
  getActiveDevicesByUser,
};
