import { z } from 'zod';

export const DtoSchema = z.object({
  title: z.string().max(30, 'Максимальная длинна - 30 символов'),
  shortDescription: z.string().max(100, 'Максимальная длинна - 100 символов'),
  content: z.string().max(1_000, 'Максимальная длинна - 1_000 символов'),
  blogId: z.string()
});

export type PostDTO = z.infer<typeof DtoSchema>;