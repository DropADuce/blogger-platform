import request from 'supertest';

import { createTestApp } from '../utils/create-test-app';
import { prepareForComment, sendComment } from './helpers/create-comment';
import { HTTP_STATUS } from '../../src/core/constants/http-statuses.constants';
import { createUser } from '../user/helpers/create-user';
import { login } from '../auth/helpers/login';

describe('comments', async () => {
  const app = await createTestApp();

  beforeEach(async () => {
    await request(app).delete('/testing/all-data');
  });

  describe('GET comments/:id', async () => {
    it('Вернет 404, если комментарий не найден', async () => {
      const { postId, token } = await prepareForComment(app);

      const comment = await sendComment(app, postId, token).expect(
        HTTP_STATUS.CREATED
      );

      await request(app)
        .delete(`/comments/${comment.body.id ?? ''}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HTTP_STATUS.NO_CONTENT);

      await request(app)
        .get(`/comments/${comment.body.id ?? ''}`)
        .expect(HTTP_STATUS.NOT_FOUND);
    });

    it('Вернет 200 и комментарий, если комментарий существует', async () => {
      const { postId, token } = await prepareForComment(app);

      const comment = await sendComment(app, postId, token).expect(
        HTTP_STATUS.CREATED
      );

      const founded = await request(app)
        .get(`/comments/${comment.body.id ?? ''}`)
        .expect(HTTP_STATUS.OK);

      expect(founded.body).toMatchObject({ id: expect.any(String) });
    });
  });

  describe('GET /posts/:id/comments', async () => {
    it('/posts/:id/comments по несуществующему посту 404', async () => {
      const { postId } = await prepareForComment(app);

      await request(app).delete(`/posts/${postId}`).auth('admin', 'qwerty');

      await request(app)
        .get(`/posts/${postId}/comments`)
        .expect(HTTP_STATUS.NOT_FOUND);
    });

    it('/posts/:id/comments 200 и список с пагинацией', async () => {
      const { postId } = await prepareForComment(app);

      const comments = await request(app)
        .get(`/posts/${postId}/comments`)
        .expect(HTTP_STATUS.OK);

      expect(comments.body.items).toBeInstanceOf(Array);
    });
  });

  describe('POST /posts/:id/comments', async () => {
    it('Без токена возвращает 401', async () => {
      const { postId } = await prepareForComment(app);

      await sendComment(app, postId).expect(HTTP_STATUS.UNAUTHORIZED);
    });

    it('С невалидным токеном возвращает 401', async () => {
      const { postId } = await prepareForComment(app);

      await sendComment(app, postId, 'test').expect(HTTP_STATUS.UNAUTHORIZED);
    });

    it('По не валидному dto возвращает 400', async () => {
      const { token, postId } = await prepareForComment(app);

      await sendComment(app, postId, token, { content: '' }).expect(
        HTTP_STATUS.BAD_REQUEST
      );
    });

    it('По несуществующему посту возвращает 404', async () => {
      const { token, postId } = await prepareForComment(app);

      await request(app)
        .delete(`/posts/${postId}`)
        .auth('admin', 'qwerty')
        .expect(HTTP_STATUS.NO_CONTENT);

      await sendComment(app, postId, token).expect(HTTP_STATUS.NOT_FOUND);
    });

    it('Если все валидно - возвращает 200 и список комментариев с пагинацией', async () => {
      const { token, postId } = await prepareForComment(app);

      const comment = await sendComment(app, postId, token).expect(
        HTTP_STATUS.CREATED
      );

      expect(comment.body).toMatchObject({ content: expect.any(String) });
    });
  });

  describe('PUT /comments/:id/', async () => {
    it('Без токена вернет 401', async () => {
      const { token, postId } = await prepareForComment(app);

      const comment = await sendComment(app, postId, token).expect(
        HTTP_STATUS.CREATED
      );

      await request(app)
        .put(`/comments/${comment.body.id ?? ''}`)
        .send({ content: 'Обновил свой очень важный (не влажный) комментарий' })
        .expect(HTTP_STATUS.UNAUTHORIZED);
    });
    it('С токеном другого пользователя вернет 403', async () => {
      const { token, postId } = await prepareForComment(app);

      const otherUser = await createUser(app, {
        login: 'Robin',
        email: 'robin@mail.ru',
        password: '123456',
      }).expect(HTTP_STATUS.CREATED);

      const otherLogin = await login(app, {
        loginOrEmail: otherUser.body.email,
        password: '123456',
      }).expect(HTTP_STATUS.OK);

      const comment = await sendComment(app, postId, token).expect(
        HTTP_STATUS.CREATED
      );

      await request(app)
        .put(`/comments/${comment.body.id ?? ''}`)
        .send({ content: 'Обновил свой очень важный комментарий' })
        .set('Authorization', `Bearer ${otherLogin.body.accessToken}`)
        .expect(HTTP_STATUS.FORBIDDEN);
    });
    it('С невалидным DTO вернет вернет 400', async () => {
      const { token, postId } = await prepareForComment(app);

      const comment = await sendComment(app, postId, token).expect(
        HTTP_STATUS.CREATED
      );

      await request(app)
        .put(`/comments/${comment.body.id ?? ''}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HTTP_STATUS.BAD_REQUEST);
    });
    it('По удаленному комментарию вернет 404', async () => {
      const { token, postId } = await prepareForComment(app);

      const comment = await sendComment(app, postId, token).expect(
        HTTP_STATUS.CREATED
      );

      await request(app)
        .delete(`/comments/${comment.body.id ?? ''}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HTTP_STATUS.NO_CONTENT);

      await request(app)
        .put(`/comments/${comment.body.id ?? ''}`)
        .send({ content: 'Обновил свой старый комментарий на новый, который гораздо лучше старого' })
        .set('Authorization', `Bearer ${token}`)
        .expect(HTTP_STATUS.NOT_FOUND);
    });
    it('При валидных данных вернет 204', async () => {
      const { token, postId } = await prepareForComment(app);

      const comment = await sendComment(app, postId, token).expect(
        HTTP_STATUS.CREATED
      );

      await request(app)
        .put(`/comments/${comment.body.id ?? ''}`)
        .send({ content: 'Обновил свой старый комментарий на новый, который гораздо лучше старого' })
        .set('Authorization', `Bearer ${token}`)
        .expect(HTTP_STATUS.NO_CONTENT);
    });
  });

  describe('DELETE /comments/:id', async () => {
    it('Без токена вернет 401', async () => {
      const { token, postId } = await prepareForComment(app);

      const comment = await sendComment(app, postId, token).expect(
        HTTP_STATUS.CREATED
      );

      await request(app)
        .delete(`/comments/${comment.body.id ?? ''}`)
        .expect(HTTP_STATUS.UNAUTHORIZED);
    });

    it('С токеном другого пользователя вернет 404', async () => {
      const { token, postId } = await prepareForComment(app);

      const otherUser = await createUser(app, {
        login: 'Robin',
        email: 'robin@mail.ru',
        password: '123456',
      }).expect(HTTP_STATUS.CREATED);

      const otherLogin = await login(app, {
        loginOrEmail: otherUser.body.email,
        password: '123456',
      }).expect(HTTP_STATUS.OK);

      const comment = await sendComment(app, postId, token).expect(
        HTTP_STATUS.CREATED
      );

      await request(app)
        .delete(`/comments/${comment.body.id ?? ''}`)
        .set('Authorization', `Bearer ${otherLogin.body.accessToken}`)
        .expect(HTTP_STATUS.FORBIDDEN);
    });

    it('По не существующему комментарию вернет 404', async () => {
      const { token, postId } = await prepareForComment(app);

      const comment = await sendComment(app, postId, token).expect(
        HTTP_STATUS.CREATED
      );

      await request(app)
        .delete(`/comments/${comment.body.id ?? ''}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HTTP_STATUS.NO_CONTENT);

      await request(app)
        .delete(`/comments/${comment.body.id ?? ''}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HTTP_STATUS.NOT_FOUND);
    });

    it('При успешном удалении вернет 204', async () => {
      const { token, postId } = await prepareForComment(app);

      const comment = await sendComment(app, postId, token).expect(
        HTTP_STATUS.CREATED
      );

      await request(app)
        .delete(`/comments/${comment.body.id ?? ''}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HTTP_STATUS.NO_CONTENT);
    });
  });
});
