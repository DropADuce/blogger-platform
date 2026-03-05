import bcrypt from 'bcrypt';

import { usersQueryRepo } from '../../../repositories/users/users.query-repo';
import { UnauthorizeError } from '../../../core/errors/unauthorize-error';
import { LoginDTO } from '../models/login.schema';

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

export const loginService = {
  login,
}
