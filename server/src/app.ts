import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cookieParser from 'cookie-parser';
import express, { type RequestHandler } from 'express';
import helmet from 'helmet';
import { accountRouter } from './account/routes.js';
import { loadUser, requireUser } from './auth/middleware.js';
import { authRouter } from './auth/routes.js';
import { config } from './config.js';
import { pingDb } from './db.js';
import { errorHandler, HttpError, notFound } from './lib/errors.js';

// Writes must be JSON. Browsers can't send cross-site JSON without a CORS
// preflight (which we never allow), so this doubles as CSRF protection
// alongside the SameSite cookie.
const requireJson: RequestHandler = (req, _res, next) => {
  // Empty bodies (a bare POST /logout) are fine. Browsers send those with
  // Content-Length: 0, which req.is() would count as a non-JSON body.
  const hasBody =
    req.headers['transfer-encoding'] !== undefined ||
    Number(req.headers['content-length'] ?? 0) > 0;
  if (hasBody && !req.is('application/json')) {
    throw new HttpError(
      415,
      'json_required',
      'Send requests as application/json.',
    );
  }
  next();
};

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  // Behind a proxy in production (Render, Railway, Fly…), so req.ip is the real client
  if (config.isProduction) app.set('trust proxy', 1);

  const api = express.Router();
  api.use(
    express.json({ limit: '100kb' }),
    cookieParser(),
    requireJson,
    loadUser,
  );
  api.get('/health', async (_req, res) => {
    await pingDb();
    res.json({ ok: true });
  });
  api.use('/auth', authRouter);
  api.use('/account', requireUser, accountRouter);
  api.use(notFound);

  app.use('/api', helmet(), api);

  // In production the same server hands out the built frontend
  if (config.isProduction) {
    const dist = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      '../../dist',
    );
    app.use(
      helmet({ contentSecurityPolicy: false }),
      express.static(dist, { index: false }),
    );
    app.get('/{*path}', (_req, res) =>
      res.sendFile(path.join(dist, 'index.html')),
    );
  }

  app.use(errorHandler);
  return app;
}
