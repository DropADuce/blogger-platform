import { IBlog } from '../../domain/blog/types/blog.types';
import { blogs } from '../../db/mongo/mongo.db';
import { Filter, Sort } from 'mongodb';
import { mapMongoIdToId } from '../../core/lib/map-mongo-id-to-id';
import { NotFoundError } from '../../core/errors/not-found.error';
import { createId } from '../../core/lib/create-id';

export const blogsQueryRepo = {
  getAll: async (params: {
    filter: Filter<IBlog>;
    sortParams: Sort;
    pagination: { skip: number; count: number };
  }) => {
    const [blogsResult, pagesCount] = await Promise.all([
      await blogs
        .find(params.filter)
        .sort(params.sortParams)
        .skip(params.pagination.skip)
        .limit(params.pagination.count)
        .toArray().then((items) => items.map(mapMongoIdToId)),
      await blogs.countDocuments(params.filter),
    ]);

    return { blogs: blogsResult, pagesCount };
  },
  findByID: async (id: string) => {
    const blog = await blogs.findOne({ _id: createId(id) });

    if (!blog)
      throw new NotFoundError(
        `Блог с id ${id} не найден`,
        'blogsQueryRepo.findByID'
      );

    return mapMongoIdToId(blog);
  },
};
