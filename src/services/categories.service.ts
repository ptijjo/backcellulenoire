import { Service } from 'typedi';
import { CreateCategoryDto } from '@dtos/categories.dto';
import { HttpException } from '@/exceptions/httpException';
import { Category } from '@interfaces/categories.interface';
import { prisma } from '@/utils/prisma';

@Service()
export class CategoryService {
  public async findAllCategory(): Promise<Category[]> {
    const allCategory: Category[] = await prisma.category.findMany();
    return allCategory;
  }

  public async findCategoryById(categoryId: string): Promise<Category> {
    const findCategory: Category | null = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!findCategory) throw new HttpException(409, "Category doesn't exist");

    return findCategory;
  }

  public async createCategory(categoryData: CreateCategoryDto): Promise<Category> {
    const newCategory = await prisma.category.create({
      data: { ...categoryData },
    });
    return newCategory;
  }
}
