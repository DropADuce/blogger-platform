import { BlogsRepo } from '../../../repositories/blogs/blogs.repo';
import { PostsRepo } from '../../../repositories/posts/posts.repo';
import { usersRepo } from '../../../repositories/users/user.repo';
import { commentsRepo } from '../../../repositories/comments/comments.repo';
import { ipRatesRepo } from '../../../repositories/ip-rates/ip-rates.repo';
import { sessionsRepo } from '../../../repositories/sessions/sessions.repo';

const clearDatabase = async (): Promise<void> => {
  await Promise.allSettled([
    PostsRepo.removeAll(),
    BlogsRepo.removeAll(),
    usersRepo.removeAll(),
    commentsRepo.removeAll(),
    ipRatesRepo.removeAll(),
    sessionsRepo.removeAll(),
  ]);
};

export const TestingService = {
  clearDatabase,
};
