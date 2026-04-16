import { injectable } from 'inversify';
import { ClientSession, Filter, ObjectId, UpdateFilter } from 'mongodb';

import { IPost } from '../../domain/post/types/post.types';
import { posts } from '../../db/mongo/mongo.db';

@injectable()
export class PostsRepository {
  createPost(post: IPost) {
    return posts.insertOne(post);
  }

  replacePost(id: string, post: Partial<IPost>, session?: ClientSession) {
    return posts.updateOne(
      { _id: new ObjectId(id) },
      { $set: post },
      session
    );
  }

  replacePosts(
    filter: Filter<IPost>,
    updater: UpdateFilter<IPost>,
    session?: ClientSession
  ) {
    return posts.updateMany(filter, updater, session);
  }

  removePost(id: string) {
    return posts.deleteOne({ _id: new ObjectId(id) });
  }

  removeAllPosts() {
    return posts.deleteMany({});
  }

  removeAllPostsByBlog(id: string, session?: ClientSession) {
    return posts.deleteMany({ blogId: id }, session);
  }
}
