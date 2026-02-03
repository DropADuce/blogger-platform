export type API_ERROR = { errorsMessages: Array<IAPIError> };

export interface IAPIError {
  message: string;
  field: string;
}