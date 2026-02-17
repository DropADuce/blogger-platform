import { PostsRepo } from '../../../repositories/posts/posts.repo';
import { BlogsRepo } from '../../../repositories/blogs/blogs.repo';
import { mapMongoIdToId } from '../../../core/lib/map-mongo-id-to-id';
import { createId } from '../../../core/lib/create-id';
import { IPost, IPostView } from '../types/post.types';
import { PostDTO } from '../schemas/dto.schema';
import { WithSortAndPaginationSchema } from '../../../core/schemas/query-params.schema';
import { buildQuery } from '../../../core/lib/build-mongo-query';
import { Filter } from 'mongodb';
import { createWithPaginationResult } from '../../../core/lib/create-with-paginatoin-result';
import { WithPaginationData } from '../../../core/types/pagination.types';

const findBlogNames = async (...ids: Array<string>) => {
  const blogs = await BlogsRepo.findManyByID(ids.map(createId));

  return new Map(blogs.map((blog) => [mapMongoIdToId(blog).id, blog.name]));
};

const findPosts = async (
  queryParams: unknown,
  filter?: Filter<IPost>
): Promise<WithPaginationData<IPostView>> => {
  const params = WithSortAndPaginationSchema.parse(queryParams);

  const query = buildQuery(params);

  const [posts, count] = await Promise.all([
    PostsRepo.getAll({ ...query, filter }),
    PostsRepo.getCount(filter),
  ]);

  const blogs = await findBlogNames(
    ...new Set(posts.map(({ blogId }) => blogId))
  );

  return createWithPaginationResult({
    pageSize: params.pageSize,
    pageNumber: params.pageNumber,
    count,
    items: posts.map((post) => ({
      ...mapMongoIdToId(post),
      blogName: blogs.get(post.blogId) ?? '',
    })),
  });
};

const findPostsByBlogID = async (id: string, queryParams: unknown) => {
  const blogs = await BlogsRepo.findByID(createId(id));

  if (!blogs) return null;

  return await findPosts(queryParams, { blogId: id });
};

const findPostById = async (id: string): Promise<IPostView | null> => {
  const post = await PostsRepo.findByID(createId(id));

  if (post) {
    const postWithID = mapMongoIdToId(post);
    const blogs = await findBlogNames(postWithID.blogId);

    return { ...postWithID, blogName: blogs.get(postWithID.blogId) ?? '' };
  }

  return null;
};

const createPost = async (post: PostDTO): Promise<IPostView | null> => {
  const newPost = {
    ...post,
    createdAt: new Date().toISOString(),
  };

  const blogName = await findBlogNames(newPost.blogId).then((data) =>
    data.get(newPost.blogId)
  );

  if (!blogName) return null;

  const result = await PostsRepo.create(newPost);

  const createdPost = await findPostById(result.insertedId.toString());

  return createdPost
    ? {
        ...createdPost,
        blogName: blogName ?? '',
      }
    : createdPost;
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
