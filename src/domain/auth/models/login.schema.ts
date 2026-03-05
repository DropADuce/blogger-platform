import { z } from 'zod';

export const LoginDTOSchema = z.object({
  loginOrEmail: z.string(),
  password: z.string(),
});

export type LoginDTO = z.infer<typeof LoginDTOSchema>;
