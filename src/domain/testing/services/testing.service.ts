import { inject, injectable } from 'inversify';

import { BlogsRepository} from '../../../repositories/blogs/blogs.repo';
import { PostsRepository } from '../../../repositories/posts/posts.repo';
import { UsersRepository } from '../../../repositories/users/user.repo';
import { CommentsRepository } from '../../../repositories/comments/comments.repo';
import { ipRatesRepo } from '../../../repositories/ip-rates/ip-rates.repo';
import { sessionsRepo } from '../../../repositories/sessions/sessions.repo';

@injectable()
export class TestingService {
  constructor(
    @inject(BlogsRepository) private blogsRepository: BlogsRepository,
    @inject(PostsRepository) private postsRepository: PostsRepository,
    @inject(CommentsRepository) private commentsRepository: CommentsRepository,
    @inject(UsersRepository) private usersRepository: UsersRepository,
  ) {}

  async clearDatabase() {
    await Promise.allSettled([
      this.blogsRepository.removeAll(),
      this.postsRepository.removeAllPosts(),
      this.commentsRepository.removeAllComments(),
      this.usersRepository.removeAllUsers(),
      ipRatesRepo.removeAll(),
      sessionsRepo.removeAll(),
    ]);
  }
}
