import bcrypt from 'bcrypt';
import { inject, injectable } from 'inversify';

import { UsersQueryRepository } from '../../../repositories/users/users.query-repo';
import { UnauthorizeError } from '../../../core/errors/unauthorize-error';
import { LoginDTO } from '../models/login.schema';
import { UsersRepository } from '../../../repositories/users/user.repo';
import { ResultStatus } from '../../../core/result/result-code';

@injectable()
export class AuthService {
  constructor(
    @inject(UsersRepository) private usersRepository: UsersRepository,
    @inject(UsersQueryRepository)
    private usersQueryRepository: UsersQueryRepository
  ) {}

  async login(dto: LoginDTO) {
    const founded = await this.usersQueryRepository.findByLoginOrEmail(
      dto.loginOrEmail
    );

    const isValid = await bcrypt.compare(dto.password, founded?.password ?? '');

    if (!isValid) throw new UnauthorizeError();
  }

  async discardToken(loginOrEmail: string, token: string) {
    const user =
      await this.usersQueryRepository.findByLoginOrEmail(loginOrEmail);

    if (user) {
      await this.usersRepository.discardToken(user.id, token);

      return {
        status: ResultStatus.Success,
        data: null,
        extensions: [],
      };
    }

    return {
      status: ResultStatus.BadRequest,
      data: null,
      extensions: [],
    };
  }
}
