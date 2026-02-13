import { z } from 'zod';
import { MongoIdSchema } from '../../../db/mongo/mongo-id.schema';

export const DtoSchema = z.object({
  title: z
    .string()
    .trim()
    .nonempty('Поле должно быть заполнено')
    .max(30, 'Максимальная длинна - 30 символов'),
  shortDescription: z
    .string()
    .trim()
    .nonempty('Поле должно быть заполнено')
    .max(100, 'Максимальная длинна - 100 символов'),
  content: z
    .string()
    .trim()
    .nonempty('Поле должно быть заполнено')
    .max(1_000, 'Максимальная длинна - 1_000 символов'),
  blogId: MongoIdSchema.nonempty('Поле должно быть заполнено')
});

export type PostDTO = z.infer<typeof DtoSchema>;
