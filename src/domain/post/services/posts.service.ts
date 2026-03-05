import { PostsRepo } from '../../../repositories/posts/posts.repo';
import { createId } from '../../../core/lib/create-id';
import { IPost } from '../types/post.types';
import { CreatePostDTO, PostDTO } from '../schemas/dto.schema';
import { IBlogViewModel } from '../../blog/types/blog.types';

const createPost = async (
  post: CreatePostDTO,
  blog: IBlogViewModel
): Promise<string> => {
  const newPost: IPost = {
    ...post,
    blogId: blog.id,
    blogName: blog.name,
    createdAt: new Date().toISOString(),
  };

  const result = await PostsRepo.create(newPost);

  return result.insertedId.toString();
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
  createPost,
  updatePost,
  deletePost,
};
