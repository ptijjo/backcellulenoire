/* eslint-disable prettier/prettier */
import { CATEGORY, PrismaClient } from '@prisma/client';
import { Service } from 'typedi';
import { AddBookDto, UpdatebookDto } from '@dtos/books.dto';
import { HttpException } from '@/exceptions/httpException';
import { Book } from '@interfaces/books.interface';
import fs from 'fs/promises';
import path from 'path';

export type FindAllBookResult = {
  allBook: Book[];
  nbBookTotal: number;
};

@Service()
export class BookService {
  public book = new PrismaClient().book;
  public category = new PrismaClient().category;


  public async findAllbook(search: string, page: number, itemPerPage: number, filtre?: CATEGORY): Promise<Book[]> {
    
    let skip = 0;
    if (page > 1) {
      skip = (page - 1) * itemPerPage
    }
    const take = Number(itemPerPage);

    // Condition pour le filtre de catégorie
    let categoryFilterCondition = {};

    if (filtre) {
      const findCategory = await this.category.findUnique({
        where: {
          type: filtre as CATEGORY,
        },
      });
  
      if (!findCategory) throw new HttpException(409, "category doesn't exist");
      categoryFilterCondition = {
        categoryId: findCategory.id,
      };
    }

    const allBook: Book[] = await this.book.findMany({
      skip,
      take,
      where: {
        AND: [{
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { author: { contains: search, mode: "insensitive" } },
          ]},
        categoryFilterCondition,
        ],
      }
    });


    return (allBook)
  }

  public async findBookById(bookId: string): Promise<Book> {
    const findBook: Book = await this.book.findUnique({ where: { id: bookId } });
    if (!findBook) throw new HttpException(409, "book doesn't exist");

    return findBook;
  }

  public async addBook(bookData: AddBookDto, categoryName: string , url: string): Promise<Book> {
    const findCategory = await this.category.findUnique({
      where: {
        type: categoryName as CATEGORY,
      },
    });

    if (!findCategory) throw new HttpException(409, "category doesn't exist");

    const newbook: Book = await this.book.create({
      data: {
        title:bookData.title,
        url: url,
        author:bookData.author,
        categoryId:findCategory.id
      },
    });

    return newbook;
    
  }

  public async updatebook(bookId: string, bookData: UpdatebookDto): Promise<Book> {
    const findBook: Book = await this.book.findUnique({ where: { id: bookId } });
    if (!findBook) throw new HttpException(409, "book doesn't exist");

    const findCategory = await this.category.findUnique({
      where: {
        type: bookData.categorie as CATEGORY
      },
    });

    if (!findCategory) throw new HttpException(409, "category doesn't exist");

    const updateBookData = await this.book.update({
      where: { id: bookId }, data: {
        title: bookData.title,
        author:bookData.author,
        categoryId: findCategory.id
      }
    });
    return updateBookData;
  }

  public async deletebook(bookId: string): Promise<Book> {
    const findBook: Book = await this.book.findUnique({ where: { id: bookId } });
    if (!findBook) throw new HttpException(409, "book doesn't exist");

    const filename = findBook.url.split("/books/")[1];
    const filePath = path.join(__dirname, '..','..','public', 'books', filename);
   
    await fs.unlink(filePath); // Supprime le fichier
      
    const deleteBookData = await this.book.delete({ where: { id: bookId } });
    return deleteBookData;
     
  }
}
