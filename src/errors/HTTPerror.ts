export class HttpError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, data: unknown) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
        ? (data as { message: string }).message
        : "Request failed";

    super(message);

    this.status = status;
    this.data = data;
  }
}
