import { z } from 'zod';

export const UserDTOSchema = z.object({
  login: z
    .string()
    .min(3, 'Минимальная длинна - 3 символа')
    .max(10, 'Максимальная длинна - 10 символов'),
  password: z
    .string()
    .min(6, 'Минимальня длинна пароля - 6 символов')
    .max(20, 'Максимальная длинна пароля - 20 символов'),
  email: z.email('Введите корректный email'),
});

export type UserDTO = z.infer<typeof UserDTOSchema>;