import { cleanEnv, port, str } from 'envalid';

export const ValidateEnv = () => {
  cleanEnv(process.env, {
    NODE_ENV: str({ choices: ['development', 'production', 'test'] }),
    PORT: port(),
    SECRET_KEY: str({ desc: 'Clé de signature JWT session' }),
    SECRET_KEY_INVITATION: str({ desc: 'Clé JWT invitation / reset' }),
    DATABASE_URL: str({ desc: 'URL MongoDB Prisma' }),
    ORIGIN: str({ desc: 'Origine CORS frontend' }),
    FRONT_END: str({ desc: 'URL frontend (liens emails)' }),
    MJ_APIKEY_PUBLIC: str({ desc: 'Mailjet public key' }),
    MJ_APIKEY_PRIVATE: str({ desc: 'Mailjet private key' }),
    EXPIRED_TOKEN: str({ default: '7d' }),
    EXPIRED_TOKEN_INVITATION: str({ default: '24h' }),
    CREDENTIALS: str({ default: 'true' }),
    HTTP_ONLY: str({ default: 'true' }),
    COOKIE_SECURE: str({ default: 'true' }),
    COOKIE_SAME_SITE: str({ choices: ['lax', 'strict', 'none', ''], default: '' }),
    COOKIE_DOMAIN: str({ default: '' }),
    STORAGE_DRIVER: str({ choices: ['local', 's3'], default: 'local' }),
    AWS_REGION: str({ default: '' }),
    AWS_S3_BUCKET: str({ default: '' }),
    AWS_ACCESS_KEY_ID: str({ default: '' }),
    AWS_SECRET_ACCESS_KEY: str({ default: '' }),
  });
};
