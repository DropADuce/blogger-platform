import { DB } from '../db/in-memory.db';

export const TestingRepo = {
  removeAll: () => {
    DB.blogs = [];
    DB.posts = [];
  }
}