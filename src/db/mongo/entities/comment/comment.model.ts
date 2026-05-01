import { HydratedDocument, Model, model, Schema } from 'mongoose';

export type Comment = {
  postId: string;
  content: string;
  commentatorInfo: Commentator;
  createdAt: Date;
  updatedAt: Date;
};

export type Commentator = {
  userId: string;
  userLogin: string;
};

type CommentModel = Model<Comment>;

export type CommentDocument = HydratedDocument<Comment>;

const CommentatorSchema = new Schema<Commentator>(
  {
    userId: {
      type: String,
      required: true,
    },
    userLogin: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const CommentsSchema = new Schema<Comment>(
  {
    postId: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    commentatorInfo: {
      type: CommentatorSchema,
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

export const CommentModel = model<Comment, CommentModel>(
  'Comment',
  CommentsSchema,
  'Comments'
);
