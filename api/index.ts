import type { IncomingMessage, ServerResponse } from 'node:http';
import { createApp } from '../server/src/app.js';
import { connectDb } from '../server/src/db.js';

// Vercel entry: the whole API as one serverless function. vercel.json sends
// every /api/* request here. Locally the API runs from server/src/index.ts.

const app = createApp();

// Connect on the first request and reuse the connection while the function
// stays warm. A failed attempt is forgotten so the next request retries.
let connecting: Promise<unknown> | null = null;

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
) {
  try {
    await (connecting ??= connectDb());
  } catch (err) {
    connecting = null;
    console.error('Could not connect to MongoDB:', err);
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        error: {
          code: 'db_unavailable',
          message: 'The library is unreachable right now.',
        },
      }),
    );
    return;
  }
  app(req, res);
}
