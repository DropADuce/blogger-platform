import { createTestApp } from '../utils/create-test-app';
import request from 'supertest';
import { createUser } from '../user/helpers/create-user';
import { HTTP_STATUS } from '../../src/core/constants/http-statuses.constants';
import { BlogTestFactory } from '../blogs/helpers/blog.factory';
import { createPostByBlog } from '../posts/helpers/create-post-by-blog';
import { sendComment } from '../comments/helpers/create-comment';
import { login } from '../auth/helpers/login';
import { Express } from 'express';

const USER_1 = {
  login: 'user1',
  password: 'user1_password_123',
  email: 'test-user-1@test.ru',
};

const USER_2 = {
  login: 'user2',
  password: 'user2_password_123',
  email: 'test-user-2@test.ru',
};

const createUsers = async (app: Express) => {
  const user1 = await createUser(app, USER_1).expect(HTTP_STATUS.CREATED);
  const user2 = await createUser(app, USER_2).expect(HTTP_STATUS.CREATED);

  return { user1, user2 };
};

const loginUser = async (
  app: Express,
  user: { login: string; password: string }
) => {
  const loginData = await login(app, {
    loginOrEmail: user.login,
    password: user.password,
  }).expect(HTTP_STATUS.OK);

  return loginData.body;
};

const makeComment = async (app: Express, accessToken: string) => {
  const blog = await BlogTestFactory.create(app);
  const post = await createPostByBlog(app, blog.id);

  const comment = await sendComment(app, post.body.id, accessToken).expect(
    HTTP_STATUS.CREATED
  );

  return comment.body;
};

const sendLikeByComment = async (
  app: Express,
  like: {
    commentId: string;
    accessToken: string;
    status: 'Like' | 'Dislike' | 'None';
  }
) => {
  return await request(app)
    .put(`/comments/${like.commentId}/like-status`)
    .send({ likeStatus: like.status })
    .set('Authorization', `Bearer ${like.accessToken}`)
    .expect(HTTP_STATUS.NO_CONTENT);
};

describe('likes', async () => {
  const app = await createTestApp();

  beforeEach(async () => {
    await request(app).delete('/testing/all-data');
  });

  describe('GET /comments/:id, тестирование лайков', async () => {
    it('Даже если лайк не поставлен, должны вернуть информацию о лайках', async () => {
      const users = await createUsers(app);

      const loginData = await loginUser(app, {
        login: users.user1.body.login,
        password: USER_1.password,
      });

      const comment = await makeComment(app, loginData.accessToken);

      expect(comment).toEqual(
        expect.objectContaining({
          likesInfo: {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: 'None',
          },
        })
      );
    });

    it('Если поставили лайк от первого пользователя, то первый пользователь увидит myStatus - Like, а второй увидит None', async () => {
      const users = await createUsers(app);

      const loginDataUser1 = await loginUser(app, {
        login: users.user1.body.login,
        password: USER_1.password,
      });

      const loginDataUser2 = await loginUser(app, {
        login: users.user2.body.login,
        password: USER_2.password,
      });

      const comment = await makeComment(app, loginDataUser1.accessToken);

      await sendLikeByComment(app, {
        commentId: comment.id,
        status: 'Like',
        accessToken: loginDataUser1.accessToken,
      });

      const byUser1Response = await request(app)
        .get(`/comments/${comment.id}`)
        .set('Authorization', `Bearer ${loginDataUser1.accessToken}`)
        .expect(HTTP_STATUS.OK);

      const byUser2Response = await request(app)
        .get(`/comments/${comment.id}`)
        .set('Authorization', `Bearer ${loginDataUser2.accessToken}`)
        .expect(HTTP_STATUS.OK);

      expect(byUser1Response.body).toMatchObject({
        likesInfo: {
          likesCount: 1,
          dislikesCount: 0,
          myStatus: 'Like',
        },
      });

      expect(byUser2Response.body).toMatchObject({
        likesInfo: {
          likesCount: 1,
          dislikesCount: 0,
          myStatus: 'None',
        },
      });
    });

    it('Если ставили лайк, а потом поставили дизлайк - количесто лайков должно стать 0, а дизлайков - 1', async () => {
      const users = await createUsers(app);

      const loginDataUser1 = await loginUser(app, {
        login: users.user1.body.login,
        password: USER_1.password,
      });

      const loginDataUser2 = await loginUser(app, {
        login: users.user2.body.login,
        password: USER_2.password,
      });

      const comment = await makeComment(app, loginDataUser1.accessToken);

      await sendLikeByComment(app, {
        commentId: comment.id,
        status: 'Like',
        accessToken: loginDataUser1.accessToken,
      });

      await sendLikeByComment(app, {
        commentId: comment.id,
        status: 'Dislike',
        accessToken: loginDataUser1.accessToken,
      });

      const byUser1Response = await request(app)
        .get(`/comments/${comment.id}`)
        .set('Authorization', `Bearer ${loginDataUser1.accessToken}`)
        .expect(HTTP_STATUS.OK);

      const byUser2Response = await request(app)
        .get(`/comments/${comment.id}`)
        .set('Authorization', `Bearer ${loginDataUser2.accessToken}`)
        .expect(HTTP_STATUS.OK);

      expect(byUser1Response.body).toMatchObject({
        likesInfo: {
          likesCount: 0,
          dislikesCount: 1,
          myStatus: 'Dislike',
        },
      });

      expect(byUser2Response.body).toMatchObject({
        likesInfo: {
          likesCount: 0,
          dislikesCount: 1,
          myStatus: 'None',
        },
      });
    });

    it('Ставили какую-либо реакцию, а потом прислали None - количество лайков и дизлайков должно стать None, myStatus - None для всех', async () => {
      const users = await createUsers(app);

      const loginDataUser1 = await loginUser(app, {
        login: users.user1.body.login,
        password: USER_1.password,
      });

      const loginDataUser2 = await loginUser(app, {
        login: users.user2.body.login,
        password: USER_2.password,
      });

      const comment = await makeComment(app, loginDataUser1.accessToken);

      await sendLikeByComment(app, {
        commentId: comment.id,
        status: 'Like',
        accessToken: loginDataUser1.accessToken,
      });

      await sendLikeByComment(app, {
        commentId: comment.id,
        status: 'None',
        accessToken: loginDataUser1.accessToken,
      });

      const byUser1Response = await request(app)
        .get(`/comments/${comment.id}`)
        .set('Authorization', `Bearer ${loginDataUser1.accessToken}`)
        .expect(HTTP_STATUS.OK);

      const byUser2Response = await request(app)
        .get(`/comments/${comment.id}`)
        .set('Authorization', `Bearer ${loginDataUser2.accessToken}`)
        .expect(HTTP_STATUS.OK);

      expect(byUser1Response.body).toMatchObject({
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
        },
      });

      expect(byUser2Response.body).toMatchObject({
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
        },
      });
    });

    it('Если оба пользователя ставили одну и ту же реацию - значение суммируется', async () => {
      const users = await createUsers(app);

      const loginDataUser1 = await loginUser(app, {
        login: users.user1.body.login,
        password: USER_1.password,
      });

      const loginDataUser2 = await loginUser(app, {
        login: users.user2.body.login,
        password: USER_2.password,
      });

      const comment = await makeComment(app, loginDataUser1.accessToken);

      await sendLikeByComment(app, {
        commentId: comment.id,
        status: 'Like',
        accessToken: loginDataUser1.accessToken,
      });

      await sendLikeByComment(app, {
        commentId: comment.id,
        status: 'Like',
        accessToken: loginDataUser2.accessToken,
      });

      const byUser1Response = await request(app)
        .get(`/comments/${comment.id}`)
        .set('Authorization', `Bearer ${loginDataUser1.accessToken}`)
        .expect(HTTP_STATUS.OK);

      const byUser2Response = await request(app)
        .get(`/comments/${comment.id}`)
        .set('Authorization', `Bearer ${loginDataUser2.accessToken}`)
        .expect(HTTP_STATUS.OK);

      expect(byUser1Response.body).toMatchObject({
        likesInfo: {
          likesCount: 2,
          dislikesCount: 0,
          myStatus: 'Like',
        },
      });

      expect(byUser2Response.body).toMatchObject({
        likesInfo: {
          likesCount: 2,
          dislikesCount: 0,
          myStatus: 'Like',
        },
      });
    });

    it('Если оба пользователя ставили одну и ту же реацию, но первый пользователь удалил свою реацию, реация должна остаться одна, свой статус увидит только второй пользователь', async () => {
      const users = await createUsers(app);

      const loginDataUser1 = await loginUser(app, {
        login: users.user1.body.login,
        password: USER_1.password,
      });

      const loginDataUser2 = await loginUser(app, {
        login: users.user2.body.login,
        password: USER_2.password,
      });

      const comment = await makeComment(app, loginDataUser1.accessToken);

      await sendLikeByComment(app, {
        commentId: comment.id,
        status: 'Like',
        accessToken: loginDataUser1.accessToken,
      });

      await sendLikeByComment(app, {
        commentId: comment.id,
        status: 'Like',
        accessToken: loginDataUser2.accessToken,
      });

      await sendLikeByComment(app, {
        commentId: comment.id,
        status: 'None',
        accessToken: loginDataUser1.accessToken,
      });

      const byUser1Response = await request(app)
        .get(`/comments/${comment.id}`)
        .set('Authorization', `Bearer ${loginDataUser1.accessToken}`)
        .expect(HTTP_STATUS.OK);

      const byUser2Response = await request(app)
        .get(`/comments/${comment.id}`)
        .set('Authorization', `Bearer ${loginDataUser2.accessToken}`)
        .expect(HTTP_STATUS.OK);

      expect(byUser1Response.body).toMatchObject({
        likesInfo: {
          likesCount: 1,
          dislikesCount: 0,
          myStatus: 'None',
        },
      });

      expect(byUser2Response.body).toMatchObject({
        likesInfo: {
          likesCount: 1,
          dislikesCount: 0,
          myStatus: 'Like',
        },
      });
    });
  });
});
