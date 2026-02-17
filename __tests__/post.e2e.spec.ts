import express from 'express';
import request from 'supertest';
import { HTTP_STATUS } from '../src/core/constants/http-statuses.constants';
import { startApp } from '../src/app/app';
import { beforeEach, expect } from 'vitest';
import { PostDTO } from '../src/domain/post/schemas/dto.schema';
import { BlogDTO } from '../src/domain/blog/schemas/dto.schema';

const CORRECT_POST_DTO: PostDTO = {
  title: 'Имя поста',
  shortDescription: 'Какое-то описание для поста',
  content: 'Тут будет контент статьи',
  blogId: 'blog id',
};

const CORRECT_BLOG_DTO: BlogDTO = {
  name: 'Имя блога',
  description: 'Какое-то описание для блога',
  websiteUrl: 'https://www.google.com/',
};

describe('/posts', async () => {
  const app = express();

  await startApp(app);

  beforeEach(async () => {
    await request(app).delete('/testing/all-data');
  });

  it('GET /posts - пока пусто вернет 200 и пустой массив', async () => {
    const response = await request(app).get('/posts').expect(HTTP_STATUS.OK);

    expect(response.body.items).toBeInstanceOf(Array);
    expect(response.body.items.length).toBe(0);
  });

  it('GET /posts возвращает список постов', async () => {
    const blog = await request(app)
      .post('/blogs')
      .auth('admin', 'qwerty')
      .send(CORRECT_BLOG_DTO);

    const newPost = await request(app)
      .post('/posts')
      .auth('admin', 'qwerty')
      .send({ ...CORRECT_POST_DTO, blogId: blog.body.id })
      .expect(HTTP_STATUS.CREATED);

    const response = await request(app).get('/posts').expect(HTTP_STATUS.OK);

    expect(response.body.items).toContainEqual(
      expect.objectContaining(newPost.body)
    );
  });

  it('GET /posts/:id возвращает 404, если не существует', async () => {
    await request(app).get('/posts/1').expect(HTTP_STATUS.NOT_FOUND);
  });

  it('GET /posts/:id возвращает 200 и запрашиваемый пост ', async () => {
    const blog = await request(app)
      .post('/blogs')
      .auth('admin', 'qwerty')
      .send(CORRECT_BLOG_DTO);

    const newPost = await request(app)
      .post('/posts')
      .auth('admin', 'qwerty')
      .send({ ...CORRECT_POST_DTO, blogId: blog.body.id })
      .expect(HTTP_STATUS.CREATED);

    const response = await request(app)
      .get(`/posts/${newPost.body.id}`)
      .expect(HTTP_STATUS.OK);

    expect(response.body).toMatchObject(newPost.body);
  });

  it('POST /posts без авторизации возвращает 401', async () => {
    await request(app).post('/posts').expect(HTTP_STATUS.UNAUTHORIZED);
  });

  it('POST /posts создает пост', async () => {
    const blog = await request(app)
      .post('/blogs')
      .auth('admin', 'qwerty')
      .send(CORRECT_BLOG_DTO);

    await request(app)
      .post('/posts')
      .auth('admin', 'qwerty')
      .send({ ...CORRECT_POST_DTO, blogId: blog.body.id })
      .expect(HTTP_STATUS.CREATED);
  });

  it('POST /posts c не корректным title вернет 400 и ошибку по title', async () => {
    const response = await request(app)
      .post('/posts')
      .auth('admin', 'qwerty')
      .send({
        ...CORRECT_POST_DTO,
        title: 'Слишком длинное имя для поста. Больше 30 символов',
      })
      .expect(HTTP_STATUS.BAD_REQUEST);

    expect(response.body).ownProperty('errorsMessages');
    expect(response.body.errorsMessages).toContainEqual(
      expect.objectContaining({ field: 'title' })
    );
  });

  it('POST /posts c не корректным shortDescription вернет 400 и ошибку по shortDescription', async () => {
    const response = await request(app)
      .post('/posts')
      .auth('admin', 'qwerty')
      .send({
        ...CORRECT_POST_DTO,
        shortDescription: `Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.`,
      })
      .expect(HTTP_STATUS.BAD_REQUEST);

    expect(response.body).ownProperty('errorsMessages');
    expect(response.body.errorsMessages).toContainEqual(
      expect.objectContaining({ field: 'shortDescription' })
    );
  });

  it('PUT /posts/:id Без авторизации возвращает 401', async () => {
    await request(app).put('/posts/1').expect(HTTP_STATUS.UNAUTHORIZED);
  });

  it('PUT /posts/:id По несуществующему id - 404', async () => {
    await request(app)
      .put('/posts/1')
      .auth('admin', 'qwerty')
      .send(CORRECT_POST_DTO)
      .expect(HTTP_STATUS.NOT_FOUND);
  });

  it('PUT /posts/:id Обновляет пост, получает 204', async () => {
    const blog = await request(app)
      .post('/blogs')
      .auth('admin', 'qwerty')
      .send(CORRECT_BLOG_DTO);

    const response = await request(app)
      .post('/posts')
      .auth('admin', 'qwerty')
      .send({ ...CORRECT_POST_DTO, blogId: blog.body.id });

    const updatedPost = { ...response.body, title: 'Другой заголовок' };

    await request(app)
      .put(`/posts/${response.body.id}`)
      .auth('admin', 'qwerty')
      .send(updatedPost)
      .expect(HTTP_STATUS.NO_CONTENT);

    const post = await request(app)
      .get(`/posts/${response.body.id}`)
      .expect(HTTP_STATUS.OK);

    expect(post.body).toMatchObject(updatedPost);
  });

  it('DELETE /post/:id Без авторизации - 401', async () => {
    const blog = await request(app)
      .post('/blogs')
      .auth('admin', 'qwerty')
      .send(CORRECT_BLOG_DTO);

    await request(app)
      .delete(`/posts/${blog.body.id}`)
      .expect(HTTP_STATUS.UNAUTHORIZED);
  });

  it('DELETE /post/:id По не верному id - 404', async () => {
    await request(app)
      .delete('/posts/1')
      .auth('admin', 'qwerty')
      .expect(HTTP_STATUS.NOT_FOUND);
  });

  it('DELETE /post/:id Когда происходит - 204', async () => {
    const blog = await request(app)
      .post('/blogs')
      .auth('admin', 'qwerty')
      .send(CORRECT_BLOG_DTO);

    const post = await request(app)
      .post('/posts')
      .auth('admin', 'qwerty')
      .send({ ...CORRECT_POST_DTO, blogId: blog.body.id })
      .expect(HTTP_STATUS.CREATED);

    await request(app)
      .delete(`/posts/${post.body.id}`)
      .auth('admin', 'qwerty')
      .expect(HTTP_STATUS.NO_CONTENT);

    await request(app)
      .get(`/posts/${post.body.id}`)
      .expect(HTTP_STATUS.NOT_FOUND);
  });
});
