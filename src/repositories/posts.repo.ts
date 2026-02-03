import { DB } from '../db/in-memory.db';
import { createId } from '../core/lib/create-id';
import { IPost } from '../domain/post/types/post.types';
import { PostDTO } from '../domain/post/schemas/dto.schema';

export const PostsRepo = {
  getAll: () => DB.posts,

  findByID: (id: string) => DB.posts.find((post: IPost) => post.id === id),

  create: (post: PostDTO) => {
    const blog = DB.blogs.find((blog) => blog.id === post.blogId);

    const newPost: IPost = {
      ...post,
      blogName: blog?.name ?? '',
      id: createId(),
    };

    DB.posts.push(newPost);

    return newPost;
  },

  replace: (id: string, postDTO: PostDTO) => {
    const blog = DB.blogs.find((blog) => blog.id === postDTO.blogId);

    const currentPost = DB.posts.find((post) => post.id === id);

    if (!currentPost) return false;

    DB.posts = DB.posts.map((post) => {
      if (post.id === currentPost.id)
        return { ...post, ...postDTO, blogName: blog?.name ?? '' };

      return post;
    });

    return true;
  },

  remove: (id: string) => {
    const postIDX = DB.posts.findIndex((post) => post.id === id);

    if (postIDX === -1) return false;

    DB.posts.splice(postIDX, 1);

    return true;
  },
};
