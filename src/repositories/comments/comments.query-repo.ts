import { ObjectId, WithId } from 'mongodb';
import { SortOrder } from 'mongoose';

import { mapMongoIdToId } from '../../core/lib/map-mongo-id-to-id';
import { NotFoundError } from '../../core/errors/not-found.error';
import { CommentModel } from '../../db/mongo/entities/comment/comment.model';
import { Like, LikesModel } from '../../db/mongo/entities/like/like.model';
import { injectable } from 'inversify';

interface IReducedLike {
  likesCount: number;
  dislikesCount: number;
  myStatus: 'Like' | 'Dislike' | 'None';
}

@injectable()
export class CommentsQueryRepository {
  private get reducedLikes(): IReducedLike {
    return {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: 'None',
    };
  }

  private mapToComment<Comment>(comment: WithId<Comment>): WithId<Comment> {
    if ('postId' in comment) delete comment['postId'];

    return comment;
  }

  private async findCommentsByPostId(params: {
    postId: string;
    page: {
      sortParams: Record<string, SortOrder>;
      pagination: { skip: number; count: number };
    };
  }) {
    const [items, count] = await Promise.all([
      CommentModel.find({ postId: params.postId })
        .sort(params.page.sortParams)
        .skip(params.page.pagination.skip)
        .limit(params.page.pagination.count)
        .lean()
        .then((items) => items.map((item) => mapMongoIdToId(item))),
      CommentModel.countDocuments({ postId: params.postId }),
    ]);

    return {
      items,
      count,
    };
  }

  private findLikesByComments(commentIds: Array<string>) {
    return LikesModel.find({
      entity: 'Comment',
      entityId: { $in: commentIds },
    }).lean();
  }

  private reduceLikesByComments(params: {
    likes: Array<Like>;
    userId: string;
  }) {
    return params.likes.reduce((acc, like) => {
      const entityId = like.entityId;

      if (!acc.has(entityId)) acc.set(entityId, this.reducedLikes);

      const entry = acc.get(entityId)!;

      if (like.status === 'Like') entry.likesCount++;
      if (like.status === 'Dislike') entry.dislikesCount++;

      if (like.userId === params.userId) {
        entry.myStatus = like.status;
      }

      return acc;
    }, new Map<string, IReducedLike>());
  }

  findCommentById(id: string) {
    return CommentModel.findById(new ObjectId(id))
      .lean()
      .then((comment) => {
        if (!comment)
          throw new NotFoundError(
            'Комментарий с указанным id не найден',
            'commentsQueryRepo.findById'
          );

        return mapMongoIdToId(this.mapToComment(comment));
      });
  }

  async findCommentByIdWithLikes(params: {
    commentId: string;
    userId: string;
  }) {
    const comment = await this.findCommentById(params.commentId);

    const likes = await this.findLikesByComments([comment.id]);

    const likesMap = this.reduceLikesByComments({
      likes,
      userId: params.userId,
    });

    return {
      ...comment,
      likesInfo: likesMap.get(comment.id) ?? {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
      },
    };
  }

  async findCommentsByPostWithLikes(params: {
    postId: string;
    userId: string;
    paginationParams: {
      sortParams: Record<string, SortOrder>;
      pagination: { skip: number; count: number };
    };
  }) {
    const comments = await this.findCommentsByPostId({
      postId: params.postId,
      page: params.paginationParams,
    });

    const ids = comments.items.map((item) => item.id);

    const likes = await this.findLikesByComments(ids);

    const likesMap = this.reduceLikesByComments({
      likes,
      userId: params.userId,
    });

    const commentsWithLikes = comments.items.map((comment) => ({
      ...comment,
      likesInfo: likesMap.get(comment.id) ?? {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None' as 'Like' | 'Dislike' | 'None',
      },
    }));

    return {
      comments: commentsWithLikes,
      count: comments.count,
    };
  }
}
