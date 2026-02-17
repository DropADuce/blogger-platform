import { PostsRepo } from '../../../repositories/posts/posts.repo';
import { BlogsRepo } from '../../../repositories/blogs/blogs.repo';
import { mapMongoIdToId } from '../../../core/lib/map-mongo-id-to-id';
import { createId } from '../../../core/lib/create-id';
import { IPost } from '../types/post.types';
import { PostDTO } from '../schemas/dto.schema';
import { WithSortAndPaginationSchema } from '../../../core/schemas/query-params.schema';
import { buildQuery } from '../../../core/lib/build-mongo-query';
import { Filter } from 'mongodb';
import { createWithPaginationResult } from '../../../core/lib/create-with-paginatoin-result';
import { WithPaginationData } from '../../../core/types/pagination.types';

const findPosts = async (
  queryParams: unknown,
  filter?: Filter<IPost>
): Promise<WithPaginationData<IPost>> => {
  const params = WithSortAndPaginationSchema.parse(queryParams);

  const query = buildQuery(params);

  const [posts, count] = await Promise.all([
    PostsRepo.getAll({ ...query, filter }),
    PostsRepo.getCount(filter),
  ]);

  return createWithPaginationResult({
    pageSize: params.pageSize,
    pageNumber: params.pageNumber,
    count,
    items: posts.map(mapMongoIdToId),
  });
};

const findPostsByBlogID = async (id: string, queryParams: unknown) => {
  const blogs = await BlogsRepo.findByID(createId(id));

  if (!blogs) return null;

  return await findPosts(queryParams, { blogId: id });
};

const findPostById = async (id: string): Promise<IPost | null> => {
  const post = await PostsRepo.findByID(createId(id));

  return post ? mapMongoIdToId(post) : null;
};

const createPost = async (post: PostDTO): Promise<IPost | null> => {
  const blog = await BlogsRepo.findByID(createId(post.blogId));

  if (!blog) return null;

  const newPost: IPost = {
    ...post,
    blogName: blog.name,
    createdAt: new Date().toISOString(),
  };

  const result = await PostsRepo.create(newPost);

  return await findPostById(result.insertedId.toString());
};

const updatePost = async (id: string, post: PostDTO): Promise<boolean> => {
  const result = await PostsRepo.replace(createId(id), post);

  return !!result.modifiedCount;
};

const deletePost = async (id: string): Promise<boolean> => {
  const deleted = await PostsRepo.remove(createId(id));

  return !!deleted.deletedCount;
};

export const PostsService = {
  findPosts,
  findPostById,
  findPostsByBlogID,
  createPost,
  updatePost,
  deletePost,
};
