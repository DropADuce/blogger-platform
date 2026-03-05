import { users } from '../../db/mongo/mongo.db';
import { ObjectId } from 'mongodb';
import { IUser } from '../../domain/user/types/user.types';

export const usersRepo = {
  create: async (user: IUser) => await users.insertOne(user),
  remove: async (id: ObjectId) => await users.deleteOne({ _id: id }),
  removeAll: async () => await users.deleteMany(),
}