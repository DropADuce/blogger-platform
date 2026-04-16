import { z } from 'zod';

export const UpdatePasswordByEmailDtoSchema = z.object({
  newPassword: z
    .string()
    .min(6, 'Минимальня длинна пароля - 6 символов')
    .max(20, 'Максимальная длинна пароля - 20 символов'),
  recoveryCode: z.string()
});

export type UpdatePasswordByEmailDTO = z.infer<typeof UpdatePasswordByEmailDtoSchema>;
