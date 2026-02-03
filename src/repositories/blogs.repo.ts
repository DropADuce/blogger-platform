import { DB } from '../db/in-memory.db';
import { IBlog } from '../domain/blog/types/blog.types';
import { BlogDTO } from '../domain/blog/schemas/dto.schema';
import { createId } from '../core/lib/create-id';

export const BlogsRepo = {
  getAll: () => DB.blogs,

  findByID: (id: string) => DB.blogs.find((blog) => blog.id === id),

  create: (blog: BlogDTO) => {
    const newBlog: IBlog = { ...blog, id: createId() };

    DB.blogs.push(newBlog);

    return newBlog;
  },

  replace: (id: string, blogDTO: BlogDTO) => {
    const currentBlog = DB.blogs.find((blog) => blog.id === id);

    if (!currentBlog) return false;

    DB.blogs = DB.blogs.map((blog) => {
      if (blog.id === currentBlog.id) return { ...blog, ...blogDTO };

      return blog;
    });

    return true;
  },

  remove: (id: string) => {
    const blogIDX = DB.blogs.findIndex((blog) => blog.id === id);

    if (blogIDX === -1) return false;

    DB.blogs.splice(blogIDX, 1);

    return true;
  }
};
