import * as jwt from 'jsonwebtoken';
import { SECRET_KEY } from '@/config';
import { NextFunction, Request, Response } from 'express';
import { HttpException } from '@/exceptions/httpException';

export const CookieGuard = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.token;
  if (!token) {
    return next(new HttpException(401, 'Token absent'));
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new HttpException(401, 'Token expiré'));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new HttpException(401, 'Token invalide'));
    }
    return next(new HttpException(401, "Erreur d'authentification"));
  }
};
