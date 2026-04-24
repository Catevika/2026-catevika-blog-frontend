export class RateLimitError extends Error {
  retryAfter: number | null;

  constructor(message: string, retryAfter: number | null) {
    super(message);
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }
}
