import { ClientSession, Filter, ObjectId, Sort } from 'mongodb';
import { IBlog } from '../../domain/blog/types/blog.types';
import { blogs } from '../../db/mongo/mongo.db';
import { BlogDTO } from '../../domain/blog/schemas/dto.schema';

export const BlogsRepo = {
  getAll: async (params: {
    filter: Filter<IBlog>;
    sortParams: Sort;
    pagination: { skip: number; count: number };
  }) =>
    await blogs
      .find(params.filter)
      .sort(params.sortParams)
      .skip(params.pagination.skip)
      .limit(params.pagination.count)
      .toArray(),
  findByID: async (id: ObjectId) => await blogs.findOne({ _id: id }),
  findManyByID: async (ids: Array<ObjectId>) =>
    await blogs.find({ _id: { $in: ids } }).toArray(),
  create: async (blog: IBlog) => await blogs.insertOne(blog),
  replace: async (id: ObjectId, blog: BlogDTO) =>
    await blogs.updateOne({ _id: id }, { $set: blog }),
  remove: async (id: ObjectId, session?: ClientSession) =>
    await blogs.deleteOne({ _id: id }, { ...session }),
  removeAll: async () => await blogs.deleteMany({}),
  getCount: async (filter: Filter<IBlog>) => await blogs.countDocuments(filter),
};
