declare global {
  type Func<TArgs extends Array<unknown> = [], TResult = void> = (...args: TArgs) => TResult
}

declare global {
  declare namespace Express {
    export interface Request {
      loginOrEmail: string | undefined;
    }
  }
}

export {}