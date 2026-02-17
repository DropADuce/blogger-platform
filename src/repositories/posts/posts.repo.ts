import { posts } from '../../db/mongo/mongo.db';
import { ClientSession, Filter, ObjectId, Sort } from 'mongodb';
import { IPost } from '../../domain/post/types/post.types';

export const PostsRepo = {
  getAll: async (params: {
    sortParams: Sort;
    pagination: { skip: number; count: number };
    filter?: Filter<IPost> | undefined
  }) =>
    await posts
      .find(params.filter)
      .sort(params.sortParams)
      .skip(params.pagination.skip)
      .limit(params.pagination.count)
      .toArray(),
  findByID: async (id: ObjectId) => await posts.findOne({ _id: id }),
  create: async (post: IPost) => await posts.insertOne(post),
  replace: async (id: ObjectId, post: Partial<IPost>) =>
    await posts.updateOne({ _id: id }, { $set: post }),
  remove: async (id: ObjectId) => await posts.deleteOne({ _id: id }),
  removeAll: async () => await posts.deleteMany({}),
  removeAllByBlog: async (id: string, session?: ClientSession) =>
    await posts.deleteMany({ blogId: id }, { ...session }),
  getCount: async (filter?: Filter<IPost>) =>
    await posts.countDocuments(filter),
};
