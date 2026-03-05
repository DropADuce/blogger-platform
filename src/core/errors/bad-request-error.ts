import { DomainError } from './domain.error';
import { HTTP_STATUS } from '../constants/http-statuses.constants';

export class BadRequestError extends DomainError {
  constructor(
    readonly details: string,
    readonly source: string,
    readonly body: unknown,
  ) {
    super(details, HTTP_STATUS.BAD_REQUEST, source);
  }
}
