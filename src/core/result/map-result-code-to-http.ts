import { HTTP_STATUS } from '../constants/http-statuses.constants';
import { ResultStatus } from './result-code';

const ERRORS_MAP = {
  [ResultStatus.Success]: HTTP_STATUS.OK,
  [ResultStatus.NotFound]: HTTP_STATUS.NOT_FOUND,
  [ResultStatus.NoContent]: HTTP_STATUS.NO_CONTENT,
  [ResultStatus.Forbidden]: HTTP_STATUS.FORBIDDEN,
  [ResultStatus.BadRequest]: HTTP_STATUS.BAD_REQUEST,
  [ResultStatus.Unauthorized]: HTTP_STATUS.UNAUTHORIZED,
};

export const mapResultCodeToHttp = (status: ResultStatus) => ERRORS_MAP[status];
