import { inject, injectable } from 'inversify';
import { LikesRepository } from '../../../repositories/likes/likes.repo';
import { UsersQueryRepository } from '../../../repositories/users/users.query-repo';
import { Result } from '../../../core/result/result.types';
import { ResultStatus } from '../../../core/result/result-code';
import { LikesQueryRepository } from '../../../repositories/likes/likes.query-repo';
import { Like } from '../../../db/mongo/entities/like/like.model';

interface LikeDTO {
  entity: 'Blog' | 'Post' | 'Comment';
  entityId: string;
  userId: string;
  status: 'Like' | 'Dislike' | 'None';
}

@injectable()
export class LikesService {
  constructor(
    @inject(LikesRepository) private readonly likesRepository: LikesRepository,
    @inject(LikesQueryRepository)
    private readonly likesQueryRepository: LikesQueryRepository,
    @inject(UsersQueryRepository)
    private readonly usersQueryRepository: UsersQueryRepository
  ) {}

  private get successResult(): Result {
    return {
      status: ResultStatus.Success,
      data: null,
      extensions: [],
    };
  }

  private get failureResult(): Result {
    return {
      status: ResultStatus.BadRequest,
      data: null,
      extensions: [],
    };
  }

  private async getIsUserExists(userId: string): Promise<Result> {
    const user = await this.usersQueryRepository.findByID(userId);

    return {
      status: user ? ResultStatus.Success : ResultStatus.BadRequest,
      data: null,
      extensions: user
        ? []
        : [{ field: 'user', message: 'Не верный id пользователя' }],
    };
  }

  private async getExistingReaction(
    params: Omit<LikeDTO, 'status'>
  ): Promise<Result<Like | null>> {
    const reaction = await this.likesQueryRepository.getReactionByUser({
      entity: params.entity,
      entityId: params.entityId,
      userId: params.userId,
    });

    return {
      status: ResultStatus.Success,
      data: reaction ?? null,
      extensions: [],
    };
  }

  private async dropReaction(params: Omit<Like, 'status'>): Promise<Result> {
    try {
      await this.likesRepository.deleteReaction(params);

      return this.successResult;
    } catch {
      return this.failureResult
    }
  }

  private async overrideReaction(params: LikeDTO): Promise<Result> {
    try {
      await this.likesRepository.overrideReaction(params);

      return this.successResult;
    } catch {
      return this.failureResult;
    }
  }

  private async setReaction(params: LikeDTO) {
    try {
      await this.likesRepository.addReaction(params);

      return this.successResult;
    } catch {
      return this.failureResult;
    }
  }

  private async resolveReaction(existingReaction: Like | null, like: LikeDTO) {
    const {status, ...likeParams} = like;

    if (status === 'None') return this.dropReaction(likeParams);

    if (existingReaction) return this.overrideReaction(like);

    return this.setReaction(like);
  }

  async addReaction(DTO: LikeDTO): Promise<Result> {
    const checkUserResult = await this.getIsUserExists(DTO.userId);

    if (checkUserResult.status !== ResultStatus.Success) return checkUserResult;

    const existingReaction = await this.getExistingReaction(DTO);

    return this.resolveReaction(existingReaction.data, DTO);
  }
}
