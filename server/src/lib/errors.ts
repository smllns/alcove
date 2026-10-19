import type { ErrorRequestHandler, RequestHandler } from 'express';

// An error that's safe to show the client: a stable code, a human message,
// and optionally a message per form field.
export class HttpError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields?: Record<string, string>;

  constructor(
    status: number,
    code: string,
    message: string,
    fields?: Record<string, string>,
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

export const notFound: RequestHandler = (_req, _res, next) =>
  next(new HttpError(404, 'not_found', 'Nothing here.'));

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({
      error: { code: err.code, message: err.message, fields: err.fields },
    });
    return;
  }
  // Malformed JSON from express.json()
  if (err?.type === 'entity.parse.failed') {
    res.status(400).json({
      error: { code: 'bad_json', message: 'Request body is not valid JSON.' },
    });
    return;
  }
  console.error(err);
  res.status(500).json({
    error: {
      code: 'server_error',
      message: 'Something went wrong on our side.',
    },
  });
};
