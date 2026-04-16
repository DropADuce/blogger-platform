import 'reflect-metadata';
import { Container } from 'inversify';

import { BlogsRepository } from '../../repositories/blogs/blogs.repo';
import { PostsRepository } from '../../repositories/posts/posts.repo';
import { BlogsService } from '../../domain/blog/services/blogs.service';
import { CommentsRepository } from '../../repositories/comments/comments.repo';
import { PostsService } from '../../domain/post/services/posts.service';
import { CommentService } from '../../domain/comment/services/comment.service';
import { TestingService } from '../../domain/testing/services/testing.service';
import { UsersRepository } from '../../repositories/users/user.repo';
import { UsersQueryRepository } from '../../repositories/users/users.query-repo';
import { EmailService } from '../../domain/auth/services/email.service';
import { AuthService } from '../../domain/auth/services/auth.service';
import { UsersService } from '../../domain/user/service/users.service';

export const container: Container = new Container();

container.bind(AuthService).toSelf();

container.bind(BlogsRepository).toSelf();
container.bind(BlogsService).toSelf();

container.bind(PostsRepository).toSelf();
container.bind(PostsService).toSelf();

container.bind(CommentsRepository).toSelf();
container.bind(CommentService).toSelf();

container.bind(UsersService).toSelf();
container.bind(UsersRepository).toSelf();
container.bind(UsersQueryRepository).toSelf();

container.bind(EmailService).toSelf();

container.bind(TestingService).toSelf();