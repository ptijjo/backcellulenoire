/* eslint-disable prettier/prettier */
import { Router } from 'express';
import { CategoryController } from '@controllers/categories.controller';
import { CreateCategoryDto } from '@dtos/categories.dto';
import { Routes } from '@interfaces/routes.interface';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import { CookieGuard } from '@/middlewares/cookie.guard';
import { RoleGuard } from '@/middlewares/role.guard';


export class CategoryRoute implements Routes {
  public path = '/categories';
  public router = Router();
  public category = new CategoryController();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, CookieGuard,RoleGuard(["modo","admin"]),this.category.getCatgeories); // Get all categories
    this.router.get(`${this.path}/:id`, CookieGuard,RoleGuard(),this.category.getCategoryId); // Get category by id
    this.router.post(`${this.path}`, CookieGuard,RoleGuard(["admin","modo"]),ValidationMiddleware(CreateCategoryDto), this.category.createCategory); // Create category
  }
}
