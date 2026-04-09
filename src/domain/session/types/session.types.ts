export interface ISession {
  userId: string;
  ip: string;
  title: string;
  lastActiveDate: Date;
  expirationDate: Date;
  deviceId: string;
}