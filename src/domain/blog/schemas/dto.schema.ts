import { z } from 'zod';

export const DtoSchema = z.object({
  name: z.string().trim().max(12, 'Максимальная длинна - 12 символов'),
  description: z.string().trim().max(500, 'Максимальная длинна - 500 символов'),
  websiteUrl: z
    .url({ message: 'Поле должно соответствовать url шаблону' })
    .max(100, 'Максимальная длинна - 100 символов'),
});

export type BlogDTO = z.infer<typeof DtoSchema>;