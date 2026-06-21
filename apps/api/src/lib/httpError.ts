// A typed error carrying an HTTP status, so controllers can throw and the error
// middleware turns it into a clean JSON body instead of a crash or a stack.
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export const notFound = (message: string): HttpError =>
  new HttpError(404, message);
