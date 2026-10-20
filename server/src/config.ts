import { z } from 'zod';

// A setting that may be absent; `KEY=` with nothing after it counts as absent
const optional = z.preprocess(
  (value) => value || undefined,
  z.string().optional(),
);

// Everything the server reads from the environment, checked once at startup
const schema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  MONGODB_URI: z
    .string({
      error:
        'MONGODB_URI is missing. Copy server/.env.example to server/.env and fill it in.',
    })
    .startsWith(
      'mongodb',
      'MONGODB_URI should start with mongodb:// or mongodb+srv://',
    ),
  MONGODB_DB: z.string().min(1).default('alcove'),
  // Vercel Blob, for cover photos people upload: the store id (set by Vercel
  // when a store is connected), or a read-write token. Without either,
  // uploads are off and everything else still works.
  BLOB_STORE_ID: optional,
  BLOB_READ_WRITE_TOKEN: optional,
  // An email (or phone) Open Library can reach us at. Sent with every
  // request, it lets us make 3 a second instead of 1.
  OPENLIBRARY_CONTACT: optional,
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('\nServer configuration is invalid:');
  for (const issue of parsed.error.issues)
    console.error(`  • ${issue.message}`);
  console.error('');
  process.exit(1);
}

export const config = {
  ...parsed.data,
  isProduction: parsed.data.NODE_ENV === 'production',
};
