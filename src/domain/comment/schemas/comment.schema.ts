import { z } from 'zod';

export const CommentDTOSchema = z.object({
  content: z
    .string()
    .trim()
    .min(20, 'Слишком короткий комментарий')
    .max(300, 'Слишком длинный комментарий'),
});

export type CommentDTO = z.infer<typeof CommentDTOSchema>;