import request from 'supertest';
import { HTTP_STATUS } from '../src/core/constants/http-statuses.constants';
import { BlogDTO } from '../src/domain/blog/schemas/dto.schema';
import { createTestApp } from './utils/create-test-app';
import { BlogTestFactory } from './utils/blog.factory';
import { IBlogViewModel } from '../src/domain/blog/types/blog.types';
import { PostWithoutBlogIdDTO } from '../src/domain/post/schemas/dto.schema';

const CORRECT_BLOG_DTO: BlogDTO = {
  name: 'Имя блога',
  description: 'Какое-то описание для блога',
  websiteUrl: 'https://www.google.com/',
};

describe('/blogs', async () => {
  const app = await createTestApp();

  beforeEach(async () => {
    await request(app).delete('/testing/all-data');
  });

  describe('GET /blogs', async () => {
    it('GET /blogs - пока пусто вернет 200 и пустой массив', async () => {
      const response = await request(app).get('/blogs').expect(HTTP_STATUS.OK);

      expect(response.body.items).toBeInstanceOf(Array);
      expect(response.body.items.length).toBe(0);
    });

    it('GET /blogs возвращает список блогов', async () => {
      const newBlog = await BlogTestFactory.create(app);

      const response = await request(app).get('/blogs').expect(HTTP_STATUS.OK);

      expect(response.body.items).toContainEqual(
        expect.objectContaining(newBlog)
      );
    });

    it('GET /blogs/:id возвращает 404, если не существует', async () => {
      await request(app).get('/blogs/1').expect(HTTP_STATUS.NOT_FOUND);
    });

    it('GET /blogs/:id возвращает 200 и запрашиваемый блог ', async () => {
      const newBlog = await BlogTestFactory.create(app);

      const response = await request(app)
        .get(`/blogs/${newBlog.id}`)
        .expect(HTTP_STATUS.OK);

      expect(response.body).toMatchObject(newBlog);
    });
  });

  describe('GET /blogs с квери параметрами', async () => {
    it('GET /blogs возвращает корректную пагинацию', async () => {
      await BlogTestFactory.create(app, { name: 'Blog 1' });
      await BlogTestFactory.create(app, { name: 'Blog 2' });
      await BlogTestFactory.create(app, { name: 'Blog 3' });

      const response = await request(app)
        .get('/blogs?pageNumber=1&pageSize=2')
        .expect(HTTP_STATUS.OK);

      expect(response.body.page).toBe(1);
      expect(response.body.pageSize).toBe(2);
      expect(response.body.totalCount).toBe(3);
      expect(response.body.pagesCount).toBe(2);
      expect(response.body.items.length).toBe(2);
    });

    it('GET /blogs возвращает вторую страницу', async () => {
      await BlogTestFactory.create(app, { name: 'A' });
      await BlogTestFactory.create(app, { name: 'B' });
      await BlogTestFactory.create(app, { name: 'C' });

      const response = await request(app)
        .get('/blogs?pageNumber=2&pageSize=2')
        .expect(HTTP_STATUS.OK);

      expect(response.body.page).toBe(2);
      expect(response.body.items.length).toBe(1);
    });

    it('GET /blogs фильтрует по searchNameTerm', async () => {
      await BlogTestFactory.create(app, { name: 'JS Blog' });
      await BlogTestFactory.create(app, { name: 'Python Blog' });

      const response = await request(app)
        .get('/blogs?searchNameTerm=j')
        .expect(HTTP_STATUS.OK);

      expect(response.body.items.length).toBe(1);
      expect(response.body.items[0].name).toContain('JS');
    });

    it('GET /blogs поиск нечувствителен к регистру', async () => {
      await BlogTestFactory.create(app, { name: 'NodeJS' });

      const response = await request(app)
        .get('/blogs?searchNameTerm=nodejs')
        .expect(200);

      expect(response.body.items.length).toBe(1);
    });

    it('GET /blogs сортирует по name asc', async () => {
      await BlogTestFactory.create(app, { name: 'C' });
      await BlogTestFactory.create(app, { name: 'A' });
      await BlogTestFactory.create(app, { name: 'B' });

      const response = await request(app)
        .get('/blogs?sortBy=name&sortDirection=asc')
        .expect(HTTP_STATUS.OK);

      const names = response.body.items.map((b: IBlogViewModel) => b.name);

      expect(names).toEqual(['A', 'B', 'C']);
    });

    it('GET /blogs сортирует по name desc', async () => {
      await BlogTestFactory.create(app, { name: 'A' });
      await BlogTestFactory.create(app, { name: 'C' });
      await BlogTestFactory.create(app, { name: 'B' });

      const response = await request(app)
        .get('/blogs?sortBy=name&sortDirection=desc')
        .expect(HTTP_STATUS.OK);

      const names = response.body.items.map((b: IBlogViewModel) => b.name);

      expect(names).toEqual(['C', 'B', 'A']);
    });
  });

  describe('GET /blogs/:id/posts', async () => {
    it('GET /blogs/:id/posts - если блога не существует - вернет 404', async () => {
      const blog = await BlogTestFactory.create(app);

      await request(app).delete(`/blogs/${blog.id}`).auth('admin', 'qwerty');

      await request(app)
        .get(`/blogs/${blog.id}/posts`)
        .expect(HTTP_STATUS.NOT_FOUND);
    });

    it('GET /blogs/:id/posts - если блога не существует - вернет пустой список, если постов нет', async () => {
      const blog = await BlogTestFactory.create(app);

      const posts = await request(app)
        .get(`/blogs/${blog.id}/posts`)
        .expect(HTTP_STATUS.OK);

      expect(posts.body.items).toBeInstanceOf(Array);
      expect(posts.body.items.length).toBe(0);
    });

    it('GET /blogs/:id/posts - если блога не существует - вернет 400, при неправильном заполнении поста', async () => {
      const blog = await BlogTestFactory.create(app);

      const post = {
        title: 'Пост',
        shortDescription: 'Описание',
      };

      await request(app)
        .post(`/blogs/${blog.id}/posts`)
        .auth('admin', 'qwerty')
        .send(post)
        .expect(HTTP_STATUS.BAD_REQUEST);
    });

    it('GET /blogs/:id/posts - вернет нужный блог и 200', async () => {
      const blog = await BlogTestFactory.create(app);

      const post = {
        title: 'Пост',
        shortDescription: 'Описание',
        content: 'Контент',
      };

      const newPost = await request(app)
        .post(`/blogs/${blog.id}/posts`)
        .auth('admin', 'qwerty')
        .send(post)
        .expect(HTTP_STATUS.CREATED);

      const posts = await request(app)
        .get(`/blogs/${blog.id}/posts`)
        .expect(HTTP_STATUS.OK);

      expect(posts.body.items).toBeInstanceOf(Array);
      expect(posts.body.items).toContainEqual(
        expect.objectContaining(newPost.body)
      );
    });
  });

  describe('POST /blogs', async () => {
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
  });

  describe('POST /blogs/:blogId', async () => {
    it('POST /blogs/:blogId - если блога не существует - вернет 404', async () => {
      await request(app)
        .post('/blogs/1/posts')
        .auth('admin', 'qwerty')
        .expect(HTTP_STATUS.NOT_FOUND);
    });

    it('POST /blogs/:blogId - создает и возращает блог', async () => {
      const blog = await BlogTestFactory.create(app);

      const post: PostWithoutBlogIdDTO = {
        title: 'Пост',
        shortDescription: 'Описание',
        content: 'Контент',
      };

      const response = await request(app)
        .post(`/blogs/${blog.id}/posts`)
        .auth('admin', 'qwerty')
        .send(post)
        .expect(HTTP_STATUS.CREATED);

      expect(response.body).toMatchObject(post);
    });
  });

  describe('PUT /blogs', async () => {
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

      const updatedBlog = { ...response.body, name: 'Другой заг' };

      await request(app)
        .put(`/blogs/${response.body.id}`)
        .auth('admin', 'qwerty')
        .send(updatedBlog)
        .expect(HTTP_STATUS.NO_CONTENT);

      const blog = await request(app)
        .get(`/blogs/${response.body.id}`)
        .expect(HTTP_STATUS.OK);

      expect(blog.body).toMatchObject(updatedBlog);
    });
  });

  describe('DELETE /blogs', async () => {
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
});
