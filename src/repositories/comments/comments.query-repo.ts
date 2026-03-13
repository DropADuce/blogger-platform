import { comments } from '../../db/mongo/mongo.db';
import { mapMongoIdToId } from '../../core/lib/map-mongo-id-to-id';
import { NotFoundError } from '../../core/errors/not-found.error';
import {
  IComment,
  ICommentByPost,
} from '../../domain/comment/types/comment.types';
import { ObjectId, Sort, WithId } from 'mongodb';

const mapToComment = (
  comment: WithId<IComment | ICommentByPost>
): WithId<IComment> => {
  if ('postId' in comment) delete comment['postId'];

  return comment;
};

const findById = (id: string) =>
  comments.findOne({ _id: new ObjectId(id) }).then((comment) => {
    if (!comment)
      throw new NotFoundError(
        'Комментарий с указанным id не найден',
        'commentsQueryRepo.findById'
      );

    return mapMongoIdToId(mapToComment(comment));
  });

const findBlogsByPostId = async (id: string, params: {
  sortParams: Sort;
  pagination: { skip: number; count: number };
}) => {
  const [items, count] = await Promise.all([
    comments
      .find({ postId: id })
      .sort(params.sortParams)
      .skip(params.pagination.skip)
      .limit(params.pagination.count)
      .toArray()
      .then((items) => items.map(item => mapMongoIdToId(mapToComment(item)))),
    comments.countDocuments(),
  ]);

  return { comments: items, count };
};

export const commentsQueryRepo = {
  findById,
  findBlogsByPostId,
};
