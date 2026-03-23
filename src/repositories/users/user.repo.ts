import { users } from '../../db/mongo/mongo.db';
import { ObjectId } from 'mongodb';
import { IUser } from '../../domain/user/types/user.types';

export const usersRepo = {
  create: async (user: IUser) => await users.insertOne(user),
  remove: async (id: ObjectId) => await users.deleteOne({ _id: id }),
  confirm: async (id: string) =>
    await users.updateMany(
      { _id: new ObjectId(id) },
      { $set: { 'emailConfirmData.isConfirmed': true } }
    ),
  removeAll: async () => await users.deleteMany(),
  updateCode: (
    id: string,
    { code, expDate }: { code: string; expDate: string }
  ) =>
    users.updateMany(
      { _id: new ObjectId(id) },
      {
        $set: {
          'emailConfirmData.code': code,
          'emailConfirmData.exp_date': expDate,
        },
      }
    ),
};
