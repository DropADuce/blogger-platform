import { inject, injectable } from 'inversify';

import { UserDTO } from '../schemas/user.schema';
import { createPassword } from '../../../core/lib/create-password';
import { UsersQueryRepository } from '../../../repositories/users/users.query-repo';
import { BadRequestError } from '../../../core/errors/bad-request-error';
import { UsersRepository } from '../../../repositories/users/user.repo';
import { createExpDate } from '../../../core/lib/create-exp-date';
import { NotFoundError } from '../../../core/errors/not-found.error';

@injectable()
export class UsersService {
  constructor(
    @inject(UsersRepository) private usersRepository: UsersRepository,
    @inject(UsersQueryRepository)
    private readonly usersQueryRepository: UsersQueryRepository
  ) {}

  private async findByLoginOrEmail(loginOrEmail: {
    login: string;
    email: string;
  }) {
    const [founded] = await Promise.all([
      this.usersQueryRepository.findByLoginOrEmail(loginOrEmail.login),
      this.usersQueryRepository.findByLoginOrEmail(loginOrEmail.email),
    ]).then((result) => result.filter(Boolean));

    return founded;
  }

  async create(user: UserDTO) {
    const password = await createPassword({ password: user.password });

    // Оно вроде и не правильно, но по ТЗ это надо сделать в BLL
    const founded = await this.findByLoginOrEmail(user);

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

    return await this.usersRepository.createUser({
      ...user,
      accountData: {
        ...user,
        password,
        createdAt: new Date().toISOString(),
      },
      emailConfirmData: {
        code: crypto.randomUUID(),
        exp_date: createExpDate(),
        isConfirmed: false,
      },
      authData: {
        blackList: [],
      },
    });
  }

  async remove(id: string) {
    const result = await this.usersRepository.removeUser(id);

    if (!result.deletedCount)
      throw new NotFoundError(
        'Не найден ни один пользователь для удаления',
        'usersService.remove'
      );
  }
}
