const dotenv = require('dotenv');
const { z } = require('zod');

// Load .env once here to centralize configuration
dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z.string().optional().default('development'),
  PORT: z.string().optional().default('3000'),
  DATABASE_URL: z.string().url().optional(),
  DB_HOST: z.string().optional(),
  DB_PORT: z.string().optional(),
  DB_NAME: z.string().optional(),
  DB_USER: z.string().optional(),
  DB_PASSWORD: z.string().optional(),
  ENCRYPTION_MASTER_KEY: z.string().min(1, 'ENCRYPTION_MASTER_KEY is required'),
  MAX_UPLOAD_BYTES: z.string().optional().default('26214400'), // 25MB
  ALLOWED_MIME: z.string().optional().default('image/png,image/jpeg,application/pdf,application/zip'),
  FRONTEND_URL: z.string().optional(),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  // Fail fast on missing required envs
  console.error('Invalid environment configuration');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const env = parsed.data;

// Validate ENCRYPTION_MASTER_KEY is base64 and decodes to 32 bytes
let masterKeyBuffer;
try {
  masterKeyBuffer = Buffer.from(env.ENCRYPTION_MASTER_KEY, 'base64');
} catch (_) {
  console.error('ENCRYPTION_MASTER_KEY must be base64-encoded');
  process.exit(1);
}

if (masterKeyBuffer.length !== 32) {
  console.error('ENCRYPTION_MASTER_KEY must decode to exactly 32 bytes');
  process.exit(1);
}

// Normalize MAX_UPLOAD_BYTES
const maxUploadBytes = Number(env.MAX_UPLOAD_BYTES);
if (!Number.isFinite(maxUploadBytes) || maxUploadBytes <= 0) {
  console.error('MAX_UPLOAD_BYTES must be a positive integer number of bytes');
  process.exit(1);
}

// Parse allowed mime types
const allowedMimeTypes = env.ALLOWED_MIME.split(',').map((s) => s.trim()).filter(Boolean);

/**
 * Export validated configuration
 */
module.exports = {
  nodeEnv: env.NODE_ENV,
  port: Number(env.PORT) || 3000,
  databaseUrl: env.DATABASE_URL,
  dbHost: env.DB_HOST,
  dbPort: env.DB_PORT ? Number(env.DB_PORT) : undefined,
  dbName: env.DB_NAME,
  dbUser: env.DB_USER,
  dbPassword: env.DB_PASSWORD,
  masterKey: masterKeyBuffer, // Buffer(32)
  maxUploadBytes,
  allowedMimeTypes,
  frontendUrl: env.FRONTEND_URL,
};