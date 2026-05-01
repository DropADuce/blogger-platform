import { injectable } from 'inversify';

import {
  Like,
  LikeDocument,
  LikesModel,
} from '../../db/mongo/entities/like/like.model';

@injectable()
export class LikesQueryRepository {
  private async getReactionByFilter(
    params: Partial<Like>
  ): Promise<LikeDocument | null> {
    return LikesModel.findOne(params);
  }

  async getReactionByUser(params: Omit<Like, 'status'>) {
    return await this.getReactionByFilter(params);
  }
}
