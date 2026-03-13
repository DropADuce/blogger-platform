import {
  IComment,
  ICommentByPost,
} from '../../domain/comment/types/comment.types';
import { comments } from '../../db/mongo/mongo.db';
import { ObjectId } from 'mongodb';

export const commentsRepo = {
  create: async (comment: IComment | ICommentByPost) => {
    const result = await comments.insertOne(comment);

    return result.insertedId.toString();
  },
  update: async (id: string, comment: { content: string }) =>
    await comments.updateOne({ _id: new ObjectId(id) }, { $set: comment }),
  remove: (id: string) => comments.deleteOne({ _id: new ObjectId(id) }),
  removeAllByPost: (id: string) => comments.deleteMany({ postId: id }),
  removeAll: () => comments.deleteMany({}),
};
