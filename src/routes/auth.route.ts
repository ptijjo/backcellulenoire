import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import { AuthController } from '@/controllers/auth.controller';
import { CreateAuthDto } from '@/dtos/auth.dto';
import { authRateLimiter } from '@/middlewares/rateLimit.middleware';

export class AuthRoute implements Routes {
  public path = '/';
  public router = Router();
  public auth = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}login`, ValidationMiddleware(CreateAuthDto), authRateLimiter, this.auth.logIn);
    this.router.get(`${this.path}logout`, this.auth.logOut);
  }
}
