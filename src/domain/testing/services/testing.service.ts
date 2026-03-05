import { BlogsRepo } from '../../../repositories/blogs/blogs.repo';
import { PostsRepo } from '../../../repositories/posts/posts.repo';
import { usersRepo } from '../../../repositories/users/user.repo';

const clearDatabase = async (): Promise<void> => {
  await Promise.allSettled([
    PostsRepo.removeAll(),
    BlogsRepo.removeAll(),
    usersRepo.removeAll(),
  ]);
};

export const TestingService = {
  clearDatabase,
};
