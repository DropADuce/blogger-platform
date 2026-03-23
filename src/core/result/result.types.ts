import { ResultStatus } from './result-code';

type ExtensionType = {
  field: string | null;
  message: string;
};

export type Result<T = null> = {
  status: ResultStatus;
  errorMessage?: string;
  extensions: ExtensionType[];
  data: T;
};
