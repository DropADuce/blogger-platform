import { z } from 'zod';

const EmailCodeSchema = z.uuidv4('Нужен код в формате uuidV4');

export const ConfirmEmailDTOSchema = z.object({
  code: EmailCodeSchema
});

export type ConfirmEmailDTO = z.infer<typeof ConfirmEmailDTOSchema>;