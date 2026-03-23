import { z } from 'zod';

const emailSchema = z.email('Невалидный email адрес');

export const EmailDTOSchema = z.object({
  email: emailSchema,
});

export type EmailDTO = z.infer<typeof EmailDTOSchema>;