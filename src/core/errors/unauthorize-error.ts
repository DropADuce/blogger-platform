import { DomainError } from './domain.error';
import { HTTP_STATUS } from '../constants/http-statuses.constants';

export class UnauthorizeError extends DomainError {
  constructor(
  ) {
    super('Не верное имя логина или пароль', HTTP_STATUS.UNAUTHORIZED);
  }
}
