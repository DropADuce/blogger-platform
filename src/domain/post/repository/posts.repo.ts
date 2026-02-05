import { DB } from '../../../db/in-memory.db';
import { IPost } from '../types/post.types';

export const PostsRepo = {
  getAll: () => DB.posts,

  findByID: (id: string) => DB.posts.find((post: IPost) => post.id === id),

  create: (post: IPost) => {
    DB.posts.push(post);

    return post;
  },

  replace: (post: IPost) => {
    DB.posts = DB.posts.map((currentPost) => {
      if (post.id === currentPost.id) return post;

      return currentPost;
    });
  },

  remove: (id: string) => {
    const postIDX = DB.posts.findIndex((post) => post.id === id);

    if (postIDX === -1) return false;

    DB.posts.splice(postIDX, 1);

    return true;
  },
};
