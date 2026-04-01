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

const mapUserToWhoModel = (user: WithId<IUser>): IUserWhoModel => ({
  login: user.accountData.login,
  email: user.accountData.email,
  userId: user._id.toString(),
});

const mapUserToViewModel = ({
  _id,
  accountData,
}: WithId<IUser>): IUserViewModel =>
  mapMongoIdToId({
    _id,
    login: accountData.login,
    email: accountData.email,
    createdAt: accountData.createdAt,
  });

export const usersQueryRepo = {
  findAll: async (params: {
    sortParams: Sort;
    pagination: { skip: number; count: number };
    filter: Filter<IUser>;
  }) => {
    const [foundedUsers, count] = await Promise.all([
      users
        .find(params.filter)
        .sort(params.sortParams)
        .skip(params.pagination.skip)
        .limit(params.pagination.count)
        .toArray(),
      users.countDocuments(params.filter),
    ]);

    return { users: foundedUsers.map(mapUserToViewModel), count };
  },

  findByID: async (id: string) => {
    const user = await users.findOne({ _id: new ObjectId(id) });

    if (!user)
      throw new NotFoundError(
        'Пользователь с указанным id не найден',
        'usersQueryRepo.findByID'
      );

    return mapUserToViewModel(user);
  },

  findByLoginOrEmail: async (loginOrEmail: string) => {
    const founded = await users.findOne({
      $or: [
        { 'accountData.login': loginOrEmail },
        { 'accountData.email': loginOrEmail },
      ],
    });

    if (founded)
      return {
        ...mapUserToViewModel(founded),
        password: founded.accountData.password,
      };
  },

  findByTokenData: async (loginOrEmail: string) => {
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

    return mapUserToWhoModel(user);
  },

  findByConfirmCode: async (code: string) => {
    const user = await users.findOne({
      $and: [
        { 'emailConfirmData.code': code },
        { 'emailConfirmData.isConfirmed': false },
      ],
    });

    return user ? mapMongoIdToId(user) : null;
  },

  getEmailConfirmData: (id: string) =>
    users
      .findOne({ _id: new ObjectId(id) })
      .then((user) => user?.emailConfirmData),

  getIsConfirmed: async (email: string) => {
    const user = await users.findOne({ 'accountData.email': email });

    if (user)
      return mapMongoIdToId({
        _id: user._id,
        isConfirmed: user.emailConfirmData.isConfirmed,
      });
  },
  isTokenInBlackLit: (loginOrEmail: string, token: string) => users.findOne({
    $or: [
      { login: loginOrEmail },
      { email: loginOrEmail }
    ],
    "authData.blackList": token
  })
};
