import { z } from 'zod';

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
