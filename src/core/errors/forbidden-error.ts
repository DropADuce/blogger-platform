import { DomainError } from './domain.error';
import { HTTP_STATUS } from '../constants/http-statuses.constants';

export class ForbiddenError extends DomainError {
  constructor() {
    super('Доступ запрещен', HTTP_STATUS.FORBIDDEN);
  }
}
