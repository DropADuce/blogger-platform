import {
  IComment,
  ICommentByPost,
} from '../../domain/comment/types/comment.types';
import { comments } from '../../db/mongo/mongo.db';
import { ObjectId } from 'mongodb';
import { injectable } from 'inversify';

@injectable()
export class CommentsRepository {
  async createComment(comment: IComment | ICommentByPost) {
    const result = await comments.insertOne(comment);

    return result.insertedId.toString();
  }

  updateComment(id: string, comment: { content: string }) {
    return comments.updateOne({ _id: new ObjectId(id) }, { $set: comment })
  }

  removeComment(id: string) {
    return comments.deleteOne({ _id: new ObjectId(id) });
  }

  removeAllCommentsByPost(id: string) {
    return comments.deleteMany({ postId: id });
  }

  removeAllComments() {
    return comments.deleteMany({});
  }
}