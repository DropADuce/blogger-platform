import { IPost } from '../../domain/post/types/post.types';
import { posts } from '../../db/mongo/mongo.db';
import { mapMongoIdToId } from '../../core/lib/map-mongo-id-to-id';
import { createId } from '../../core/lib/create-id';
import { NotFoundError } from '../../core/errors/not-found.error';
import { IQueryParams } from '../../core/types/query-params.types';

export const postsQueryRepo = {
  getAll: async (params: IQueryParams<IPost>) => {
    return await Promise.all([
      posts
        .find(params.filter ?? {})
        .sort(params.sortParams ?? {})
        .skip(params.pagination?.skip ?? 0)
        .limit(params.pagination?.count ?? -1)
        .toArray(),
      posts.countDocuments(params.filter),
    ]).then(([posts, count]) => ({
      posts: posts.map(mapMongoIdToId),
      count,
    }));
  },
  findByID: async (id: string) => {
    const post = await posts.findOne({ _id: createId(id) });

    if (!post)
      throw new NotFoundError(
        `Пост с ${id} не найден`,
        'postsQueryRepo.findByID'
      );

    return mapMongoIdToId(post);
  },
};
