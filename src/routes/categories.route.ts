/* eslint-disable prettier/prettier */
import { Router } from 'express';
import { CategoryController } from '@controllers/categories.controller';
import { CreateCategoryDto } from '@dtos/categories.dto';
import { Routes } from '@interfaces/routes.interface';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import { modo } from '@/middlewares/modo';
import { auth } from '@/middlewares/auth';


export class CategoryRoute implements Routes {
  public path = '/categories';
  public router = Router();
  public category = new CategoryController();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, modo,this.category.getCatgeories);
    this.router.get(`${this.path}/:id`, auth,this.category.getCategoryId);
    this.router.post(`${this.path}`, modo,ValidationMiddleware(CreateCategoryDto), this.category.createCategory);
  }
}
