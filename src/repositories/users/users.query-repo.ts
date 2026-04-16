import { injectable } from 'inversify';
import { Filter, ObjectId, Sort, WithId } from 'mongodb';

import { users } from '../../db/mongo/mongo.db';
import { IUser } from '../../domain/user/types/user.types';
import { mapMongoIdToId } from '../../core/lib/map-mongo-id-to-id';
import { NotFoundError } from '../../core/errors/not-found.error';

interface IUserViewModel {
  id: string;
  login: string;
  email: string;
  createdAt: string;
}

interface IUserWhoModel {
  login: string;
  email: string;
  userId: string;
}

@injectable()
export class UsersQueryRepository {
  private mapUserToWhoModel(user: WithId<IUser>): IUserWhoModel {
    return {
      login: user.accountData.login,
      email: user.accountData.email,
      userId: user._id.toString(),
    };
  }

  private mapUserToViewModel({
    _id,
    accountData,
  }: WithId<IUser>): IUserViewModel {
    return mapMongoIdToId({
      _id,
      login: accountData.login,
      email: accountData.email,
      createdAt: accountData.createdAt,
    });
  }

  async findAll(params: {
    sortParams: Sort;
    pagination: { skip: number; count: number };
    filter: Filter<IUser>;
  }) {
    const [foundedUsers, count] = await Promise.all([
      users
        .find(params.filter)
        .sort(params.sortParams)
        .skip(params.pagination.skip)
        .limit(params.pagination.count)
        .toArray(),
      users.countDocuments(params.filter),
    ]);

    return { users: foundedUsers.map(this.mapUserToViewModel), count };
  }

  async findByID(id: string) {
    const user = await users.findOne({ _id: new ObjectId(id) });

    if (!user)
      throw new NotFoundError(
        'Пользователь с указанным id не найден',
        'usersQueryRepo.findByID'
      );

    return this.mapUserToViewModel(user);
  }

  async findByLoginOrEmail(loginOrEmail: string) {
    const founded = await users.findOne({
      $or: [
        { 'accountData.login': loginOrEmail },
        { 'accountData.email': loginOrEmail },
      ],
    });

    if (founded)
      return {
        ...this.mapUserToViewModel(founded),
        password: founded.accountData.password,
      };
  }

  async findByTokenData(loginOrEmail: string) {
    const user = await users.findOne({
      $or: [
        { 'accountData.login': loginOrEmail },
        { 'accountData.email': loginOrEmail },
      ],
    });

    if (!user)
      throw new NotFoundError(
        'Пользователь не найден',
        'usersQueryRepo.findByTokenData'
      );

    return this.mapUserToWhoModel(user);
  }

  async findByConfirmCode(code: string) {
    const user = await users.findOne({
      $and: [
        { 'emailConfirmData.code': code },
        { 'emailConfirmData.isConfirmed': false },
      ],
    });

    return user ? mapMongoIdToId(user) : null;
  }

  getEmailConfirmData(id: string) {
    return users
      .findOne({ _id: new ObjectId(id) })
      .then((user) => user?.emailConfirmData);
  }

  async getIsConfirmed(email: string) {
    const user = await users.findOne({ 'accountData.email': email });

    if (user)
      return mapMongoIdToId({
        _id: user._id,
        isConfirmed: user.emailConfirmData.isConfirmed,
      });
  }
  async isTokenInBlackLit(loginOrEmail: string, token: string) {
    return users.findOne({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
      'authData.blackList': token,
    });
  }
}
