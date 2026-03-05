import { ClientSession, ObjectId } from 'mongodb';
import { IBlog } from '../../domain/blog/types/blog.types';
import { blogs } from '../../db/mongo/mongo.db';
import { BlogDTO } from '../../domain/blog/schemas/dto.schema';

export const BlogsRepo = {
  create: async (blog: IBlog) => await blogs.insertOne(blog),
  replace: async (id: ObjectId, blog: BlogDTO, session?: ClientSession) =>
    await blogs.updateOne({ _id: id }, { $set: blog }, session),
  remove: async (id: ObjectId, session?: ClientSession) =>
    await blogs.deleteOne({ _id: id }, session),
  removeAll: async () => await blogs.deleteMany({}),
};
