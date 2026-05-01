import { injectable } from 'inversify';

import { Like, LikesModel } from '../../db/mongo/entities/like/like.model';

@injectable()
export class LikesRepository {
  async addReaction(params: Like) {
    const likesModel = new LikesModel(params);

    return await likesModel.save();
  }

  async overrideReaction({ status, ...params }: Like) {
    return LikesModel.findOneAndUpdate(
      params,
      { status },
      { returnDocument: 'after' }
    );
  }

  async deleteReaction(params: Omit<Like, 'status'>) {
    return LikesModel.findOneAndDelete(params, { returnDocument: 'before' });
  }

  async removeAllReactions() {
    return LikesModel.deleteMany({});
  }
}
