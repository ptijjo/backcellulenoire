import { config } from 'dotenv';
config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

const parseBool = (value: string | undefined, defaultValue: boolean): boolean => {
  if (value === undefined || value === '') return defaultValue;
  return value === 'true' || value === '1';
};

export const CREDENTIALS = parseBool(process.env.CREDENTIALS, true);
export const HTTP_ONLY = parseBool(process.env.HTTP_ONLY, true);
export const COOKIE_SECURE = parseBool(process.env.COOKIE_SECURE, true);
export const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined;
export const STORAGE_DRIVER = (process.env.STORAGE_DRIVER as 'local' | 's3') || 'local';

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
  LINK_PASSWORD,
  AWS_REGION,
  AWS_S3_BUCKET,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
} = process.env;

/** Prod (sous-domaines) : lax. Dev cross-origin (localhost ≠ 127.0.0.1) : none. */
export const COOKIE_SAME_SITE: 'lax' | 'strict' | 'none' =
  (process.env.COOKIE_SAME_SITE as 'lax' | 'strict' | 'none' | undefined) ||
  (NODE_ENV === 'production' ? 'lax' : 'none');
