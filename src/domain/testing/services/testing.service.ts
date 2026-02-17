import { BlogsRepo } from '../../../repositories/blogs/blogs.repo';
import { PostsRepo } from '../../../repositories/posts/posts.repo';

const clearDatabase = async (): Promise<void> => {
  await Promise.allSettled([PostsRepo.removeAll(), BlogsRepo.removeAll()]);
};

export const TestingService = {
  clearDatabase,
};
