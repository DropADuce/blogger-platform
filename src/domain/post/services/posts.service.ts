import { inject, injectable } from 'inversify';

import { IPost } from '../types/post.types';
import { CreatePostDTO, PostDTO } from '../schemas/dto.schema';
import { IBlogViewModel } from '../../blog/types/blog.types';
import { CommentsRepository } from '../../../repositories/comments/comments.repo';
import { PostsRepository } from '../../../repositories/posts/posts.repo';
import { Result } from '../../../core/result/result.types';
import { ResultStatus } from '../../../core/result/result-code';

@injectable()
export class PostsService {
  constructor(
    @inject(PostsRepository) private readonly postsRepository: PostsRepository,
    @inject(CommentsRepository)
    private readonly commentsRepository: CommentsRepository
  ) {}

  private createModelFromDTO(post: CreatePostDTO, blog: IBlogViewModel): IPost {
    return {
      ...post,
      blogId: blog.id,
      blogName: blog.name,
      createdAt: new Date().toISOString(),
    };
  }

  async createPost(
    post: CreatePostDTO,
    blog: IBlogViewModel
  ): Promise<Result<{ id: string }>> {
    const result = await this.postsRepository.createPost(
      this.createModelFromDTO(post, blog)
    );

    return {
      status: result.insertedId
        ? ResultStatus.Success
        : ResultStatus.BadRequest,
      data: { id: result.insertedId.toString() },
      extensions: [],
    };
  }

  async updatePost(id: string, dto: PostDTO): Promise<Result> {
    const result = await this.postsRepository.replacePost(id, dto);

    return {
      status: result.modifiedCount
        ? ResultStatus.Success
        : ResultStatus.BadRequest,
      data: null,
      extensions: [],
    };
  }

  async deletePost(id: string): Promise<Result> {
    const deletePostResult = await this.postsRepository.removePost(id);

    await this.commentsRepository.removeAllCommentsByPost(id);

    return {
      status: deletePostResult.deletedCount
        ? ResultStatus.Success
        : ResultStatus.BadRequest,
      data: null,
      extensions: [],
    };
  }
}
