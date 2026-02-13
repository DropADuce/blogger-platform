import { ClientSession, ObjectId } from 'mongodb';
import { IBlog } from '../types/blog.types';
import { blogs } from '../../../db/mongo/mongo.db';

export const BlogsRepo = {
  getAll: async () => await blogs.find().toArray(),
  findByID: async (id: ObjectId) => await blogs.findOne({ _id: id }),
  findManyByID: async (ids: Array<ObjectId>) =>
    await blogs.find({ _id: { $in: ids } }).toArray(),
  create: async (blog: IBlog) => await blogs.insertOne(blog),
  replace: async (id: ObjectId, blog: IBlog) =>
    await blogs.updateOne({ _id: id }, { $set: blog }),
  remove: async (id: ObjectId, session?: ClientSession) =>
    await blogs.deleteOne({ _id: id }, { ...session }),
  removeAll: async () => await blogs.deleteMany({}),
};
