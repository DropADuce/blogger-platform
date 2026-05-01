import { z } from 'zod';

export const LikeStatusDtoSchema = z.object({
  likeStatus: z.enum(['None', 'Like', 'Dislike']),
});

export type LikeStatusDTO = z.infer<typeof LikeStatusDtoSchema>;
