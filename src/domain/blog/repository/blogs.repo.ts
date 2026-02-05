import { DB } from '../../../db/in-memory.db';
import { IBlog } from '../types/blog.types';

export const BlogsRepo = {
  getAll: () => DB.blogs,

  findByID: (id: string) => DB.blogs.find((blog) => blog.id === id),

  create: (blog: IBlog) => {
    DB.blogs.push(blog);

    return blog;
  },

  replace: (newBlog: IBlog) => {
    DB.blogs = DB.blogs.map((blog) => {
      if (blog.id === newBlog.id) return newBlog;

      return blog;
    });
  },

  remove: (id: string) => {
    const blogIDX = DB.blogs.findIndex((blog) => blog.id === id);

    if (blogIDX === -1) return false;

    DB.blogs.splice(blogIDX, 1);

    return true;
  },
};
