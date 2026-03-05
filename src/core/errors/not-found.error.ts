import { DomainError } from './domain.error';
import { HTTP_STATUS } from '../constants/http-statuses.constants';

export class NotFoundError extends DomainError {
  constructor(
    readonly details: string,
    readonly source: string
  ) {
    super(details, HTTP_STATUS.NOT_FOUND, source);
  }
}
