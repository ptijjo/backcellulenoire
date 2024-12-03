import { config } from 'dotenv';
config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const CREDENTIALS = process.env.CREDENTIALS === 'true';
export const {
  NODE_ENV,
  PORT,
  SECRET_KEY,
  EXPIRED_TOKEN,
  LOG_FORMAT,
  LOG_DIR,
  ORIGIN,
  DATABASE_URL,
  MJ_APIKEY_PUBLIC,
  MJ_APIKEY_PRIVATE,
  FRONT_END,
  SECRET_KEY_INVITATION,
  EXPIRED_TOKEN_INVITATION,
} = process.env;
