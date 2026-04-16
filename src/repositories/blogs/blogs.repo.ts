import { injectable } from 'inversify';
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

@injectable()
export class BlogsRepository {
  createBlog(blog: IBlog) {
    return blogs.insertOne(blog);
  }

  replaceBlog(id: string, blog: BlogDTO, session?: ClientSession) {
    return blogs.updateOne({ _id: new ObjectId(id) }, { $set: blog }, session);
  }

  removeBlog(id: string, session?: ClientSession) {
    return blogs.deleteOne({ _id: new ObjectId(id) }, session);
  }

  removeAll() {
    return blogs.deleteMany({});
  }
}
