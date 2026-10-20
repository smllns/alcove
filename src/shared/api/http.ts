// Thin fetch wrapper for our own API. Same origin (Vite proxies /api in dev),
// so the session cookie rides along automatically.

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  // Per-field messages for forms, keyed by field name
  readonly fields: Record<string, string>;

  constructor(
    status: number,
    code: string,
    message: string,
    fields: Record<string, string> = {},
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

type ErrorBody = {
  error?: { code?: string; message?: string; fields?: Record<string, string> };
};

type RequestOptions = { method?: string; body?: unknown };

// Sends the request; any answer but a success becomes an ApiError
async function send(
  path: string,
  { method = 'GET', body }: RequestOptions,
): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      headers:
        body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      0,
      'network',
      'Can’t reach the server. Check your connection and try again.',
    );
  }
  if (res.ok) return res;

  const data = (await res.json().catch(() => null)) as ErrorBody | null;
  throw new ApiError(
    res.status,
    data?.error?.code ?? 'unknown',
    data?.error?.message ?? 'Something went wrong. Please try again.',
    data?.error?.fields,
  );
}

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const res = await send(path, options);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// For answers that are a file rather than JSON, e.g. a picture
export const requestBlob = async (path: string, options: RequestOptions = {}) =>
  (await send(path, options)).blob();
