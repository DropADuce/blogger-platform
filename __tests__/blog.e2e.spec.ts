import express from 'express';
import request from 'supertest';
import { HTTP_STATUS } from '../src/core/constants/http-statuses.constants';
import { setupApp } from '../src/setup-app';
import { BlogDTO } from '../src/domain/blog/schemas/dto.schema';
import { beforeEach, expect } from 'vitest';

const CORRECT_BLOG_DTO: BlogDTO = {
  name: 'Имя блога',
  description: 'Какое-то описание для блога',
  websiteUrl: 'https://www.google.com/',
};

describe('/blogs', () => {
  const app = express();

  setupApp(app);

  beforeEach(() => {
    request(app).delete('/testing/all-data');
  });

  it('GET /blogs - пока пусто вернет 200 и пустой массив', async () => {
    const response = await request(app).get('/blogs').expect(HTTP_STATUS.OK);

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(0);
  });

  it('GET /blogs возвращает список блогов', async () => {
    const newBlog = await request(app)
      .post('/blogs')
      .auth('admin', 'qwerty')
      .send(CORRECT_BLOG_DTO)
      .expect(HTTP_STATUS.CREATED);

    const response = await request(app).get('/blogs').expect(HTTP_STATUS.OK);

    expect(response.body).toContainEqual(expect.objectContaining(newBlog.body));
  });

  it('GET /blogs/:id возвращает 404, если не существует', async () => {
    await request(app).get('/blogs/1').expect(HTTP_STATUS.NOT_FOUND);
  });

  it('GET /blogs/:id возвращает 200 и запрашиваемый блог ', async () => {
    const newBlog = await request(app)
      .post('/blogs')
      .auth('admin', 'qwerty')
      .send(CORRECT_BLOG_DTO)
      .expect(HTTP_STATUS.CREATED);

    const response = await request(app)
      .get(`/blogs/${newBlog.body.id}`)
      .expect(HTTP_STATUS.OK);

    expect(response.body).toMatchObject(newBlog.body);
  });

  it('POST /blogs без авторизации возвращает 401', async () => {
    await request(app).post('/blogs').expect(HTTP_STATUS.UNAUTHORIZED);
  });

  it('POST /blogs создает блог', async () => {
    await request(app)
      .post('/blogs')
      .auth('admin', 'qwerty')
      .send(CORRECT_BLOG_DTO)
      .expect(HTTP_STATUS.CREATED);
  });

  it('POST /blogs c не корректным name вернет 400 и ошибку по name', async () => {
    const response = await request(app)
      .post('/blogs')
      .auth('admin', 'qwerty')
      .send({ ...CORRECT_BLOG_DTO, name: 'Слишком длинно имя для блога' })
      .expect(HTTP_STATUS.BAD_REQUEST);

    expect(response.body).ownProperty('errorsMessages');
    expect(response.body.errorsMessages).toContainEqual(
      expect.objectContaining({ field: 'name' })
    );
  });

  it('POST /blogs c не корректным description вернет 400 и ошибку по description', async () => {
    const response = await request(app)
      .post('/blogs')
      .auth('admin', 'qwerty')
      .send({
        ...CORRECT_BLOG_DTO,
        description: `Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit`,
      })
      .expect(HTTP_STATUS.BAD_REQUEST);

    expect(response.body).ownProperty('errorsMessages');
    expect(response.body.errorsMessages).toContainEqual(
      expect.objectContaining({ field: 'description' })
    );
  });

  it('POST /blogs c не корректным websiteURL вернет 400 и ошибку по websiteURL', async () => {
    const response = await request(app)
      .post('/blogs')
      .auth('admin', 'qwerty')
      .send({
        ...CORRECT_BLOG_DTO,
        websiteUrl: 'test',
      })
      .expect(HTTP_STATUS.BAD_REQUEST);

    expect(response.body).ownProperty('errorsMessages');
    expect(response.body.errorsMessages).toContainEqual(
      expect.objectContaining({ field: 'websiteUrl' })
    );
  });

  it('PUT /blogs/:id Без авторизации возвращает 401', async () => {
    await request(app).put('/blogs/1').expect(HTTP_STATUS.UNAUTHORIZED);
  });

  it('PUT /blogs/:id По несуществующему id - 404', async () => {
    await request(app)
      .put('/blogs/1')
      .auth('admin', 'qwerty')
      .send(CORRECT_BLOG_DTO)
      .expect(HTTP_STATUS.NOT_FOUND);
  });

  it('PUT /blogs/:id Обновляет блог, получает 204', async () => {
    const response = await request(app)
      .post('/blogs')
      .auth('admin', 'qwerty')
      .send(CORRECT_BLOG_DTO);

    const updatedPost = { ...response.body, title: 'Другой заголовок' };

    await request(app)
      .put(`/blogs/${response.body.id}`)
      .auth('admin', 'qwerty')
      .send(updatedPost)
      .expect(HTTP_STATUS.NO_CONTENT);

    const blog = await request(app)
      .get(`/blogs/${response.body.id}`)
      .expect(HTTP_STATUS.OK);

    expect(blog.body).toMatchObject(updatedPost);
  });

  it('DELETE /blog/:id Без авторизации - 401', async () => {
    await request(app).delete('/blogs/1').expect(HTTP_STATUS.UNAUTHORIZED);
  });

  it('DELETE /blog/:id По не верному id - 404', async () => {
    await request(app)
      .delete('/blogs/1')
      .auth('admin', 'qwerty')
      .expect(HTTP_STATUS.NOT_FOUND);
  });

  it('DELETE /blog/:id Когда происходит - 204', async () => {
    const blog = await request(app)
      .post('/blogs')
      .auth('admin', 'qwerty')
      .send(CORRECT_BLOG_DTO)
      .expect(HTTP_STATUS.CREATED);

    await request(app)
      .delete(`/blogs/${blog.body.id}`)
      .auth('admin', 'qwerty')
      .expect(HTTP_STATUS.NO_CONTENT);

    await request(app)
      .get(`/blogs/${blog.body.id}`)
      .expect(HTTP_STATUS.NOT_FOUND);
  });
});
