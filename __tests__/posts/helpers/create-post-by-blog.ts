import request from 'supertest';
import { Express } from 'express';
import { HTTP_STATUS } from '../../../src/core/constants/http-statuses.constants';
import { PostDTO } from '../../../src/domain/post/schemas/dto.schema';

const POST_DTO_FALLBACK: Partial<PostDTO> = {
  title: 'Пост',
  shortDescription: 'Описание',
  content: 'Контент',
};

export const createPostByBlog = (
  app: Express,
  blogId: string,
  dto: Partial<PostDTO> = POST_DTO_FALLBACK
) =>
  request(app)
    .post(`/blogs/${blogId}/posts`)
    .auth('admin', 'qwerty')
    .send({ ...POST_DTO_FALLBACK, blogId, ...dto })
    .expect(HTTP_STATUS.CREATED);
