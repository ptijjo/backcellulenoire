import { Router } from 'express';
import { AdminController } from '@controllers/admin.controller';
import { Routes } from '@interfaces/routes.interface';
import { CookieGuard } from '@/middlewares/cookie.guard';
import { RoleGuard } from '@/middlewares/role.guard';

export class AdminRoute implements Routes {
  public path = '/admin';
  public router = Router();
  public admin = new AdminController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}_dashboard`, CookieGuard, RoleGuard(['admin', 'modo']), this.admin.getDashboard);
  }
}
