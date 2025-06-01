/* eslint-disable prettier/prettier */
import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { Category } from '@interfaces/categories.interface';
import { CategoryService } from '@services/categories.service';
import { ROLE } from '@prisma/client';
import { HttpException } from '@/exceptions/httpException';
// import { CreateCategoryDto } from '@/dtos/categories.dto';

export class CategoryController {
  public category = Container.get(CategoryService);

  public getCatgeories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const findAllCategoriesData: Category[] = await this.category.findAllCategory();

      res.status(200).json({ data: findAllCategoriesData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getCategoryId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categoryId = String(req.params.id);
      const findOneCategoryData: Category = await this.category.findCategoryById(categoryId);

      res.status(200).json({ data: findOneCategoryData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categoryData: Category = req.body;

      if (req.user.role !== ROLE.admin && req.user.role !== ROLE.modo) {
        throw new HttpException(404, "Opération non authorisée !");
      }
      
      const createCategoryData: Category = await this.category.createCategory(categoryData);

      res.status(201).json({ data: createCategoryData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

 

  
}
