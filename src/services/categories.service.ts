/* eslint-disable prettier/prettier */
import { PrismaClient } from '@prisma/client';
import { Service } from 'typedi';
import { CreateCategoryDto } from '@dtos/categories.dto';
import { HttpException } from '@/exceptions/httpException';
import { Category } from '@interfaces/categories.interface';

@Service()
export class CategoryService {
  public category = new PrismaClient().category;

  public async findAllCategory(): Promise<Category[]> {
    const allCategory: Category[] = await this.category.findMany();
    return allCategory;
  }

  public async findCategoryById(categoryId: string): Promise<Category> {
    const findCategory: Category = await this.category.findUnique({ where: { id: categoryId } });
    if (!findCategory) throw new HttpException(409, "Category doesn't exist");

    return findCategory;
  }

    public async createCategory(categoryData: CreateCategoryDto): Promise<Category> {     
      
    const newCategory = await this.category.create({
        data: {...categoryData},
    });
    return newCategory;
  }
}
