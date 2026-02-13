import { z } from 'zod';
import { ObjectId } from 'mongodb';

export const MongoIdSchema = z
  .string()
  .refine(ObjectId.isValid, 'Не корректный ID');
