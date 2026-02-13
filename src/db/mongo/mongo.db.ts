import { Collection, Db, MongoClient } from 'mongodb';
import { IBlog } from '../../domain/blog/types/blog.types';
import { IPost } from '../../domain/post/types/post.types';
import { SETTINGS } from '../../core/settings/setting';

const BLOGS_COLLECTION_NAME = 'blogs';
const POSTS_COLLECTION_NAME = 'posts';

export let client: MongoClient;
export let posts: Collection<IPost>;
export let blogs: Collection<IBlog>;

export const runDB = async (url: string = ''): Promise<void> => {
  client = new MongoClient(url);

  const DB: Db = client.db(SETTINGS.DB_NAME);

  blogs = DB.collection<IBlog>(BLOGS_COLLECTION_NAME);
  posts = DB.collection<IPost>(POSTS_COLLECTION_NAME);

  try {
    await client.connect();
    await DB.command({ ping: 1 });

    console.log('Успешно подключились к базе данных');
  } catch {
    await client.close();

    throw new Error(
      'Соединение с базой данных прощло не успешно. Дальнейшая работа не возможна'
    );
  }
};