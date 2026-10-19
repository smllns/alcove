import { createApp } from './app.js';
import { config } from './config.js';
import { connectDb, disconnectDb } from './db.js';

try {
  await connectDb();
} catch (err) {
  console.error('\nCould not connect to MongoDB.');
  console.error(
    'Check MONGODB_URI in server/.env, the database user password, and that',
  );
  console.error('your IP is allowed under Network Access in Atlas.\n');
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}

const server = createApp().listen(config.PORT, () => {
  console.log(`API ready on http://localhost:${config.PORT}`);
});

const shutdown = () =>
  server.close(() => void disconnectDb().then(() => process.exit(0)));
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
