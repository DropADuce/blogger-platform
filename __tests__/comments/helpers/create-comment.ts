import request from 'supertest';
import { Express } from 'express';
import { createUser } from '../../user/helpers/create-user';
import { UserDTO } from '../../../src/domain/user/schemas/user.schema';
import { login } from '../../auth/helpers/login';
import { BlogTestFactory } from '../../blogs/helpers/blog.factory';
import { createPostByBlog } from '../../posts/helpers/create-post-by-blog';
import { CommentDTO } from '../../../src/domain/comment/schemas/comment.schema';

const USER_DATA: UserDTO = {
  login: 'Testing',
  password: 'Batman',
  email: 'testing@mail.ru',
};

const COMMENT_DTO_FALLBACK: CommentDTO = {
  content:
    'Отличная статья, дружище! Продолжай набивать руку, у тебя отлично выходит!',
};

export const sendComment = (
  app: Express,
  postId: string,
  token: string = '',
  dto: Partial<CommentDTO> = {}
) => {
  const req = request(app).post(`/posts/${postId}/comments`).send({ ...COMMENT_DTO_FALLBACK, ...dto });

  if (token) {
    req.set('Authorization', `Bearer ${token}`);
  }

  return req;
};

export const prepareForComment = async (app: Express) => {
  // 1. Создадим пользователя
  await createUser(app, USER_DATA);
  // 2. Авторизуемся как созданный пользователь
  const loginResponse = await login(app, {
    loginOrEmail: USER_DATA.login,
    password: USER_DATA.password,
  });
  // 3. Создаем блог
  const blog = await BlogTestFactory.create(app);
  // 4. По созданному блогу создаем пост
  const post = await createPostByBlog(app, blog.id);

  return { postId: post.body.id, token: loginResponse.body.accessToken };
};
