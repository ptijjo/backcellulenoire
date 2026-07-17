import rateLimit from 'express-rate-limit';

export const authRateLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 15,
  message: 'Trop de tentatives, réessayez plus tard',
  skipSuccessfulRequests: false,
});

export const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Trop de demandes de réinitialisation, réessayez plus tard',
  skipSuccessfulRequests: true,
});

export const inviteRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: "Trop d'invitations envoyées, réessayez plus tard",
  skipSuccessfulRequests: true,
});

export const downloadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Trop de téléchargements, réessayez plus tard',
  skipSuccessfulRequests: false,
});

export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: "Trop d'uploads, réessayez plus tard",
  skipSuccessfulRequests: true,
});
