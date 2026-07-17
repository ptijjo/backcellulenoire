import { CookieOptions } from 'express';
import { COOKIE_DOMAIN, COOKIE_SAME_SITE, COOKIE_SECURE, HTTP_ONLY } from '@/config';

export const sessionCookieOptions = (maxAge?: number): CookieOptions => {
  const options: CookieOptions = {
    httpOnly: HTTP_ONLY,
    secure: COOKIE_SECURE,
    sameSite: COOKIE_SAME_SITE,
  };

  if (COOKIE_DOMAIN) {
    options.domain = COOKIE_DOMAIN;
  }

  if (typeof maxAge === 'number') {
    options.maxAge = maxAge;
  }

  return options;
};
