declare global {
  type Func<TArgs extends Array<unknown> = [], TResult = void> = (...args: TArgs) => TResult
}

export {}