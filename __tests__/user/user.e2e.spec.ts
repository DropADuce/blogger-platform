import { createTestApp } from '../utils/create-test-app';
import request from 'supertest';
import { HTTP_STATUS } from '../../src/core/constants/http-statuses.constants';
import { createUser } from './helpers/create-user';

describe('/users', async () => {
  const app = await createTestApp();

  beforeEach(async () => {
    await request(app).delete('/testing/all-data');
  });

  describe('GET', async () => {
    it('/users - без авторизации - 401', async () => {
      await request(app).get('/users').expect(HTTP_STATUS.UNAUTHORIZED);
    });

    it('/users возвращает 200 и пустой массив, если элементов нет', async () => {
      await request(app)
        .get('/users')
        .auth('admin', 'qwerty')
        .expect(HTTP_STATUS.OK);
    });

    it('/users без параметров вернет 200 и всех найденных пользователей', async () => {
      await Promise.all([
        createUser(app, { login: 'first', email: 'first@mail.ru' }),
        createUser(app, { login: 'second', email: 'second@mail.ru' }),
      ]);

      const users = await request(app)
        .get('/users')
        .auth('admin', 'qwerty')
        .expect(HTTP_STATUS.OK);

      expect(users.body.items).toBeInstanceOf(Array);
      expect(users.body.items.length).toBe(2);
    });

    it('/users правильно фильтрует по searchLoginTerm', async () => {
      await Promise.all([
        createUser(app, { login: 'lOgin' }),
        createUser(app, { login: 'some_login' }),
      ]);

      const users = await request(app)
        .get('/users?searchLoginTerm=login')
        .auth('admin', 'qwerty')
        .expect(HTTP_STATUS.OK);

      expect(users.body.items.length).toBe(2);
    });

    it('/users правильно фильтрует по searchEmailTerm', async () => {
      await Promise.all([
        createUser(app, { email: 'test1@mail.ru' }),
        createUser(app, { login: 'test2@mail.ru' }),
      ]);

      const users = await request(app)
        .get('/users?searchEmailTerm=1')
        .auth('admin', 'qwerty')
        .expect(HTTP_STATUS.OK);

      expect(users.body.items.length).toBe(1);
    });

    it('/users правильно реализует пагинацию', async () => {
      await Promise.all([
        createUser(app, { login: 'login1', email: 'login1@mail.ru' }),
        createUser(app, { login: 'login2', email: 'login2@mail.ru' }),
        createUser(app, { login: 'login3', email: 'login3@mail.ru' }),
        createUser(app, { login: 'login4', email: 'login4@mail.ru' }),
      ]);

      const users = await request(app)
        .get('/users?pageSize=2&pageNumber=2')
        .auth('admin', 'qwerty')
        .expect(HTTP_STATUS.OK);

      expect(users.body.items.length).toBe(2);
    });

    it('/users - сортировка работает корректно', async () => {
      await Promise.all([
        createUser(app, { login: 'login1', email: 'login1@mail.ru' }),
        createUser(app, { login: 'login2', email: 'login2@mail.ru' }),
        createUser(app, { login: 'login3', email: 'login3@mail.ru' }),
        createUser(app, { login: 'login4', email: 'login4@mail.ru' }),
      ]);

      const users = await request(app)
        .get('/users?sortBy=login&sortDirection=asc')
        .auth('admin', 'qwerty')
        .expect(HTTP_STATUS.OK);

      expect(users.body.items.map((v: { login: string }) => v.login)).toEqual([
        'login1',
        'login2',
        'login3',
        'login4',
      ]);
    });
  });

  describe('POST', async () => {
    it('/users без авторизации - 401', async () => {
      await request(app).post('/users').expect(HTTP_STATUS.UNAUTHORIZED);
    });

    it('/users с коротким логином вернет 400', async () => {
      await createUser(app, { login: '1' }).expect(HTTP_STATUS.BAD_REQUEST);
    });

    it('/users с длинным логином вернет 400', async () => {
      await createUser(app, { login: 'Очень длинный логин' }).expect(
        HTTP_STATUS.BAD_REQUEST
      );
    });

    it('/users с коротким паролем вернет 400', async () => {
      await createUser(app, { password: 'qaz' }).expect(
        HTTP_STATUS.BAD_REQUEST
      );
    });

    it('/users с длинным логином вернет 400', async () => {
      await createUser(app, {
        password: 'Очень длинный, но очень надежный пароль',
      }).expect(HTTP_STATUS.BAD_REQUEST);
    });

    it('/users с невалидным email вернет 400', async () => {
      await createUser(app, {
        email: 'email',
      }).expect(HTTP_STATUS.BAD_REQUEST);
    });

    it('/users - по уникальному username с валидным dto вернет 201', async () => {
      await createUser(app).expect(HTTP_STATUS.CREATED);
    });

    it('/users - если пользователь уже существует - вернет 400 и массив ошибок', async () => {
      await createUser(app).expect(HTTP_STATUS.CREATED);
      const duplicate = await createUser(app).expect(HTTP_STATUS.BAD_REQUEST);

      expect(duplicate.body.errorsMessages).toContainEqual(
        expect.objectContaining({ field: 'email' })
      );
    });
  });

  describe('DELETE', async () => {
    it('/users без авторизации - 401', async () => {
      await request(app).delete('/users/1').expect(HTTP_STATUS.UNAUTHORIZED);
    });

    it('/users при удлаении - 204', async () => {
      const user = await createUser(app);

      await request(app)
        .delete(`/users/${user.body.id}`)
        .auth('admin', 'qwerty')
        .expect(HTTP_STATUS.NO_CONTENT);
    });

    it('/users при удалении по несуществующему id - 404', async () => {
      const user = await createUser(app);

      await request(app)
        .delete(`/users/${user.body.id}`)
        .auth('admin', 'qwerty')
        .expect(HTTP_STATUS.NO_CONTENT);

      await request(app)
        .delete(`/users/${user.body.id}`)
        .auth('admin', 'qwerty')
        .expect(HTTP_STATUS.NOT_FOUND);
    });
  });
});
