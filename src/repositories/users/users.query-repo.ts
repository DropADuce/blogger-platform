import { Filter, ObjectId, Sort, WithId } from 'mongodb';
import { users } from '../../db/mongo/mongo.db';
import { IUser } from '../../domain/user/types/user.types';
import { mapMongoIdToId } from '../../core/lib/map-mongo-id-to-id';
import { NotFoundError } from '../../core/errors/not-found.error';

interface IUserViewModel {
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
  login: user.login,
  email: user.email,
  userId: user._id.toString(),
});

const mapUserToViewModel = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  password,
  ...user
}: WithId<IUser>): IUserViewModel => mapMongoIdToId(user);

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

  findByID: async (id: ObjectId) => {
    const user = await users.findOne({ _id: id });

    if (!user)
      throw new NotFoundError(
        'Пользователь с указанным id не найден',
        'usersQueryRepo.findByID'
      );

    return mapUserToViewModel(user);
  },
  findByLoginOrEmail: async (loginOrEmail: string) =>
    await users.findOne({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
    }),
  findByTokenData: async (loginOrEmail: string) => {
    const user = await users.findOne({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });

    if (!user)
      throw new NotFoundError(
        'Пользователь не найден',
        'usersQueryRepo.findByTokenData'
      );

    return mapUserToWhoModel(user);
  },
};
