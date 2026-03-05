import { UserDTO } from '../schemas/user.schema';
import { usersRepo } from '../../../repositories/users/user.repo';
import { createId } from '../../../core/lib/create-id';
import { NotFoundError } from '../../../core/errors/not-found.error';
import { createPassword } from '../../../core/lib/create-password';
import { BadRequestError } from '../../../core/errors/bad-request-error';
import { usersQueryRepo } from '../../../repositories/users/users.query-repo';

const findByLoginOrEmail = async (loginOrEmail: {
  login: string;
  email: string;
}) => {
  const [founded] = await Promise.all([
    usersQueryRepo.findByLoginOrEmail(loginOrEmail.login),
    usersQueryRepo.findByLoginOrEmail(loginOrEmail.email),
  ]).then((result) => result.filter(Boolean));

  return founded;
};

const create = async (user: UserDTO) => {
  const password = await createPassword({ password: user.password });

  // Оно вроде и не правильно, но по ТЗ это надо сделать в BLL
  const founded = await findByLoginOrEmail(user);

  if (founded) {
    const duplicateField = founded.email === user.email ? 'email' : 'login';

    throw new BadRequestError(
      'Не уникальный пользователь',
      'usersService.create',
      {
        errorsMessages: [
          {
            field: duplicateField,
            message: 'Пользователь с тем же значением поля уже существует',
          },
        ],
      }
    );
  }

  return await usersRepo.create({
    ...user,
    password,
    createdAt: new Date().toISOString(),
  });
};

const remove = async (id: string) => {
  const result = await usersRepo.remove(createId(id));

  if (!result.deletedCount)
    throw new NotFoundError(
      'Не найден ни один пользователь для удаления',
      'usersService.remove'
    );
};

export const usersService = {
  create,
  remove,
};
