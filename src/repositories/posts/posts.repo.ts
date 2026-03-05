import { posts } from '../../db/mongo/mongo.db';
import { ClientSession, Filter, ObjectId, UpdateFilter } from 'mongodb';
import { IPost } from '../../domain/post/types/post.types';

export const PostsRepo = {
  create: async (post: IPost) => await posts.insertOne(post),
  replace: async (
    id: ObjectId,
    post: Partial<IPost>,
    session?: ClientSession
  ) => await posts.updateOne({ _id: id }, { $set: post }, session),
  replaceMany: (
    filter: Filter<IPost>,
    updater: UpdateFilter<IPost>,
    session?: ClientSession
  ) => posts.updateMany(filter, updater, session),
  remove: async (id: ObjectId) => await posts.deleteOne({ _id: id }),
  removeAll: async () => await posts.deleteMany({}),
  removeAllByBlog: async (id: string, session?: ClientSession) =>
    await posts.deleteMany({ blogId: id }, { ...session }),
};
