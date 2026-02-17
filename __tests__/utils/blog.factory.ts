import request from 'supertest';
import { Express } from 'express';
import { BlogDTO } from '../../src/domain/blog/schemas/dto.schema';
import { IBlogViewModel } from '../../src/domain/blog/types/blog.types';
import { HTTP_STATUS } from '../../src/core/constants/http-statuses.constants';

export const BlogTestFactory = {
  async create(app: Express, dto?: Partial<BlogDTO>): Promise<IBlogViewModel> {
    const defaultDto: BlogDTO = {
      name: 'Имя блога',
      description: 'Описание',
      websiteUrl: 'https://google.com',
    };

    const response = await request(app)
      .post('/blogs')
      .auth('admin', 'qwerty')
      .send({ ...defaultDto, ...dto })
      .expect(HTTP_STATUS.CREATED);

    return response.body;
  },
};
