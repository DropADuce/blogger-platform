export class DomainError extends Error {
  constructor(
    details: string,
    public readonly code: number,
    public readonly source?: string
  ) {
    super(details);
  }
}
