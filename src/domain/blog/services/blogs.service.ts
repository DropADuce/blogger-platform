import { BlogsRepo } from '../../../repositories/blogs/blogs.repo';
import { IBlog } from '../types/blog.types';
import { createId } from '../../../core/lib/create-id';
import { BlogDTO } from '../schemas/dto.schema';
import { client } from '../../../db/mongo/mongo.db';
import { PostsRepo } from '../../../repositories/posts/posts.repo';
import { NotFoundError } from '../../../core/errors/not-found.error';

const createBlog = async (blog: BlogDTO) => {
  const newBlog: IBlog = {
    ...blog,
    isMembership: false,
    createdAt: new Date().toISOString(),
  };

  const result = await BlogsRepo.create(newBlog);

  return result.insertedId.toString();
};

const updateBlog = async (id: string, blog: BlogDTO) => {
  const session = client.startSession();

  try {
    await session.withTransaction(async () => {
      const result = await BlogsRepo.replace(createId(id), blog, session);

      if (!result.matchedCount) {
        throw new NotFoundError(
          `В репозитории нет блога с id ${id}`,
          'updateBlog'
        );
      }

      await PostsRepo.replaceMany(
        { blogId: id },
        { $set: { blogName: blog.name } },
        session
      );
    });
  } finally {
    await session.endSession();
  }
};

const deleteBlog = async (id: string): Promise<boolean> => {
  const session = client.startSession();

  try {
    return await session.withTransaction(async () => {
      const blogDeleteResult = await BlogsRepo.remove(createId(id), session);

      if (!blogDeleteResult.deletedCount) return false;

      await PostsRepo.removeAllByBlog(id, session);

      return true;
    });
  } finally {
    await session.endSession();
  }
};

export const BlogsService = {
  createBlog,
  updateBlog,
  deleteBlog,
};
