import { comments } from '../../db/mongo/mongo.db';
import { ObjectId } from 'mongodb';
import { injectable } from 'inversify';
import { Comment, CommentModel } from '../../db/mongo/entities/comment/comment.model';

@injectable()
export class CommentsRepository {
  async createComment(comment: Comment) {
    const doc = new CommentModel(comment);

    await doc.save();

    return doc._id.toString();
  }

  updateComment(id: string, comment: { content: string }) {
    return CommentModel.findByIdAndUpdate(new ObjectId(id), comment, {
      returnDocument: 'after',
    });
  }

  removeComment(id: string) {
    return CommentModel.findByIdAndDelete(new ObjectId(id), {
      returnDocument: 'before',
    });
  }

  removeAllCommentsByPost(id: string) {
    return comments.deleteMany({ postId: id });
  }

  removeAllComments() {
    return comments.deleteMany({});
  }
}
