import { BlogsRepo } from '../../../repositories/blogs/blogs.repo';
import { mapMongoIdToId } from '../../../core/lib/map-mongo-id-to-id';
import { IBlog, IBlogViewModel } from '../types/blog.types';
import { createId } from '../../../core/lib/create-id';
import { BlogDTO } from '../schemas/dto.schema';
import { client } from '../../../db/mongo/mongo.db';
import { PostsRepo } from '../../../repositories/posts/posts.repo';
import { WithFilterAndSortAndPaginationSchema } from '../../../core/schemas/query-params.schema';
import { WithPaginationData } from '../../../core/types/pagination.types';
import { buildQuery } from '../../../core/lib/build-mongo-query';
import { createWithPaginationResult } from '../../../core/lib/create-with-paginatoin-result';

const findBlogs = async (
  queryParams: unknown
): Promise<WithPaginationData<IBlogViewModel>> => {
  const params = WithFilterAndSortAndPaginationSchema.parse(queryParams);

  const query = buildQuery(params, 'name');

  const [blogs, count] = await Promise.all([
    BlogsRepo.getAll(query),
    BlogsRepo.getCount(query.filter),
  ]);

  return createWithPaginationResult({
    pageNumber: params.pageNumber,
    pageSize: params.pageSize,
    items: blogs.map(mapMongoIdToId),
    count,
  });
};

const findBlogById = async (id: string): Promise<IBlog | null> => {
  const blog = await BlogsRepo.findByID(createId(id));

  return blog ? mapMongoIdToId(blog) : blog;
};

const createBlog = async (blog: BlogDTO): Promise<IBlog | null> => {
  const newBlog: IBlog = {
    ...blog,
    isMembership: false,
    createdAt: new Date().toISOString(),
  };

  const createBlogResult = await BlogsRepo.create(newBlog);

  return await findBlogById(createBlogResult.insertedId.toString());
};

const updateBlog = async (id: string, blog: BlogDTO): Promise<IBlog | null> => {
  const session = client.startSession();

  try {
    const [result, posts] = await Promise.all([
      BlogsRepo.replace(createId(id), blog, session),
      PostsRepo.getAll({ filter: { blogId: id } }),
    ]);

    if (!result.matchedCount) {
      await session.endSession();

      return null;
    }

    await Promise.all(
      posts.map((post) => PostsRepo.replace(post._id, { blogName: blog.name }))
    );

    await session.endSession();

    return await findBlogById(id)
  } catch (error: unknown) {
    await session.endSession();

    throw error;
  }
};

const deleteBlog = async (id: string): Promise<boolean> => {
  const session = client.startSession();

  try {
    const deleteResult = await session.withTransaction(async () => {
      const blogDeleteResult = await BlogsRepo.remove(createId(id), session);

      if (!blogDeleteResult.deletedCount) return false;

      await PostsRepo.removeAllByBlog(id, session);

      return true;
    });

    await session.endSession();

    return deleteResult;
  } catch (error: unknown) {
    await session.endSession();

    throw error;
  }
};

export const BlogsService = {
  findBlogs,
  findBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
};
