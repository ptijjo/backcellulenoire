/* eslint-disable prettier/prettier */
import { Router } from 'express';
import { BookController } from '@controllers/books.controller';
import { AddBookDto, UpdatebookDto } from '@dtos/books.dto';
import { Routes } from '@interfaces/routes.interface';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import { modo } from '@/middlewares/modo';
import { auth } from '@/middlewares/auth';
import uploadBook from '@/middlewares/uploadBooks.middleware';

export class BookRoute implements Routes {
  public path = '/books';
  public router = Router();
  public book = new BookController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.book.getBooks);
    this.router.get(`${this.path}/:id`, auth, this.book.getBookById);
    this.router.post(`${this.path}`, modo,uploadBook,ValidationMiddleware(AddBookDto), this.book.addBook);
    this.router.put(`${this.path}/:id`, modo, ValidationMiddleware(UpdatebookDto, true), this.book.updateBook);
    this.router.delete(`${this.path}/:id`, modo, this.book.deleteBook);
  }
}
