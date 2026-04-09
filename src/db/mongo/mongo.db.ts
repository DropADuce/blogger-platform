import { Collection, Db, MongoClient } from 'mongodb';
import { IBlog } from '../../domain/blog/types/blog.types';
import { IPost } from '../../domain/post/types/post.types';
import { SETTINGS } from '../../core/settings/setting';
import { IUser } from '../../domain/user/types/user.types';
import {
  IComment,
  ICommentByPost,
} from '../../domain/comment/types/comment.types';
import { IIPRate } from '../../domain/ip-rates/rate.types';
import { ISession } from '../../domain/session/types/session.types';

const BLOGS_COLLECTION_NAME = 'blogs';
const POSTS_COLLECTION_NAME = 'posts';
const USERS_COLLECTION_NAME = 'users';
const COMMENTS_COLLECTION_NAME = 'comments';
const IP_RATES_COLLECTION_NAME = 'ip-rates';
const SESSIONS_COLLECTION_NAME = 'sessions';

export let client: MongoClient;
export let posts: Collection<IPost>;
export let blogs: Collection<IBlog>;
export let users: Collection<IUser>;
export let comments: Collection<IComment | ICommentByPost>;
export let ipRates: Collection<IIPRate>;
export let sessions: Collection<ISession>;

export const runDB = async (url: string = ''): Promise<void> => {
  client = new MongoClient(url);

  const DB: Db = client.db(SETTINGS.DB_NAME);

  blogs = DB.collection<IBlog>(BLOGS_COLLECTION_NAME);
  posts = DB.collection<IPost>(POSTS_COLLECTION_NAME);
  users = DB.collection<IUser>(USERS_COLLECTION_NAME);
  comments = DB.collection<IComment>(COMMENTS_COLLECTION_NAME);
  ipRates = DB.collection<IIPRate>(IP_RATES_COLLECTION_NAME);
  sessions = DB.collection<ISession>(SESSIONS_COLLECTION_NAME);

  try {
    await client.connect();
    await DB.command({ ping: 1 });

    console.log('Успешно подключились к базе данных');
  } catch {
    await client.close();

    throw new Error(
      'Соединение с базой данных прошло не успешно. Дальнейшая работа не возможна'
    );
  }
};
