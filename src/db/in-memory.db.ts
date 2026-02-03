import { IBlog } from '../domain/blog/types/blog.types';
import { IPost } from '../domain/post/types/post.types';

interface IDB {
  blogs: Array<IBlog>;
  posts: Array<IPost>;
}

export const DB: IDB = {
  blogs: [],
  posts: [],
}