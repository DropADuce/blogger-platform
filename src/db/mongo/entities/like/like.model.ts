import { HydratedDocument, Model, model, Schema } from 'mongoose';

export type Like = {
  entity: 'Blog' | 'Post' | 'Comment';
  status: 'Like' | 'Dislike' | 'None';
  entityId: string;
  userId: string;
}

type LikeModel = Model<Like>;

const LikeEntityType = ['Blog', 'Post', 'Comment'] as const;
const LikeStatusType = ['Like', 'Dislike', 'None'] as const;

export type LikeDocument = HydratedDocument<Like>;

const LikesSchema = new Schema<Like>(
  {
    entity: {
      type: String,
      enum: LikeEntityType,
      required: true,
    },
    entityId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: LikeStatusType,
      required: true,
    },
  },
  { timestamps: true }
);

export const LikesModel = model<Like, LikeModel>('Like', LikesSchema, 'Likes');
