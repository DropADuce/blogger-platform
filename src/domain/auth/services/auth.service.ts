import bcrypt from 'bcrypt';

import { usersQueryRepo } from '../../../repositories/users/users.query-repo';
import { UnauthorizeError } from '../../../core/errors/unauthorize-error';
import { LoginDTO } from '../models/login.schema';
import { usersRepo } from '../../../repositories/users/user.repo';
import { Result } from '../../../core/result/result.types';
import { ResultStatus } from '../../../core/result/result-code';

const login = async (loginDTO: LoginDTO) => {
  const founded = await usersQueryRepo.findByLoginOrEmail(
    loginDTO.loginOrEmail
  );

  const isValid = await bcrypt.compare(
    loginDTO.password,
    founded?.password ?? ''
  );

  if (!isValid) throw new UnauthorizeError();
};

const discardToken = async (
  loginOrEmail: string,
  token: string
): Promise<Result> => {
  const user = await usersQueryRepo.findByLoginOrEmail(loginOrEmail);

  if (user) {
    await usersRepo.discardToken(user.id, token);

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
};

export const authService = {
  login,
  discardToken,
};
