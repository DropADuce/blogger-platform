import { inject, injectable } from 'inversify';

import { BlogDTO } from '../schemas/dto.schema';
import { IBlog } from '../types/blog.types';
import { BlogsRepository } from '../../../repositories/blogs/blogs.repo';
import { Result } from '../../../core/result/result.types';
import { ResultStatus } from '../../../core/result/result-code';
import { client } from '../../../db/mongo/mongo.db';
import { PostsRepository } from '../../../repositories/posts/posts.repo';

@injectable()
export class BlogsService {
  constructor(
    @inject(BlogsRepository) private readonly blogsRepository: BlogsRepository,
    @inject(PostsRepository) private readonly postsRepository: PostsRepository
  ) {}

  private BlogDTOToModel(dto: BlogDTO): IBlog {
    return {
      ...dto,
      isMembership: false,
      createdAt: new Date().toISOString(),
    };
  }

  async createBlog(blog: BlogDTO): Promise<Result<{ id: string }>> {
    const newBlog: IBlog = {
      ...blog,
      isMembership: false,
      createdAt: new Date().toISOString(),
    };

    const result = await this.blogsRepository.createBlog(
      this.BlogDTOToModel(newBlog)
    );

    return {
      status: result.insertedId
        ? ResultStatus.Success
        : ResultStatus.BadRequest,
      data: { id: result.insertedId.toString() ?? '' },
      extensions: [],
    };
  }

  async updateBlog(id: string, blog: BlogDTO): Promise<Result> {
    const result: Result = {
      status: ResultStatus.Success,
      data: null,
      extensions: [],
    };

    const session = client.startSession();

    // TODO: Вероятно это потом тоже стоит вынести в IoC
    try {
      await session.withTransaction(async () => {
        const replaceResult = await this.blogsRepository.replaceBlog(
          id,
          blog,
          session
        );

        if (!replaceResult.matchedCount) {
          result.status = ResultStatus.NotFound;

          return;
        }

        // TODO: Тоже отвратительно конечно. Если еще вернусь сюда - надо исправить
        await this.postsRepository.replacePosts(
          { blogId: id },
          { $set: { blogName: blog.name } }
        );
      });

      return result;
    } catch {
      return {
        status: ResultStatus.BadRequest,
        data: null,
        extensions: [],
      };
    } finally {
      await session.endSession();
    }
  }

  async deleteBlog(id: string): Promise<Result> {
    const result: Result = {
      status: ResultStatus.NoContent,
      data: null,
      extensions: [],
    };

    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        const blogDeleteResult = await this.blogsRepository.removeBlog(
          id,
          session
        );

        if (!blogDeleteResult.deletedCount) return false;

        await this.postsRepository.removeAllPostsByBlog(id, session);

        return true;
      });

      return result;
    } catch {
      return {
        status: ResultStatus.BadRequest,
        data: null,
        extensions: [],
      };
    } finally {
      await session.endSession();
    }
  }
}
