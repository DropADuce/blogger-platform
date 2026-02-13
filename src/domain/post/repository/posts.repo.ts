import { posts } from '../../../db/mongo/mongo.db';
import { ClientSession, ObjectId } from 'mongodb';
import { IPost } from '../types/post.types';

export const PostsRepo = {
  getAll: async () => await posts.find().toArray(),
  findByID: async (id: ObjectId) => await posts.findOne({ _id: id }),
  create: async (post: IPost) => await posts.insertOne(post),
  replace: async (id: ObjectId, post: Partial<IPost>) =>
    await posts.updateOne({ _id: id }, { $set: post }),
  remove: async (id: ObjectId) => await posts.deleteOne({ _id: id }),
  removeAll: async () => await posts.deleteMany({}),
  removeAllByBlog: async (id: string, session?: ClientSession) =>
    await posts.deleteMany({ blogId: id }, { ...session }),
};
