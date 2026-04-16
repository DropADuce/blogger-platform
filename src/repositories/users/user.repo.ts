import { ObjectId } from 'mongodb';

import { users } from '../../db/mongo/mongo.db';
import { IUser } from '../../domain/user/types/user.types';
import { injectable } from 'inversify';

@injectable()
export class UsersRepository {
  createUser(user: IUser) {
    return users.insertOne(user);
  }

  updateUserPassword(id: string, password: string) {
    return users.updateOne(
      { _id: new ObjectId(id) },
      { $set: { 'accountData.password': password } }
    );
  }

  confirmCode(id: string) {
    return users.updateOne(
      { _id: new ObjectId(id) },
      { $set: { 'emailConfirmData.isConfirmed': true } }
    );
  }

  updateConfirmCode(
    id: string,
    codePayload: { code: string; expDate: string }
  ) {
    return users.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          'emailConfirmData.code': codePayload.code,
          'emailConfirmData.exp_date': codePayload.expDate,
        },
      }
    );
  }

  // TODO: Это удалить потом, когда будет время
  discardToken(id: string, token: string) {
    return users.updateOne(
      { _id: new ObjectId(id) },
      { $push: { 'authData.blackList': token } }
    );
  }

  removeUser(id: string) {
    return users.deleteOne({ _id: new ObjectId(id) });
  }

  removeAllUsers() {
    return users.deleteMany({});
  }
}
