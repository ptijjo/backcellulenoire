/* eslint-disable prettier/prettier */
import { Router } from 'express';
import { BookController } from '@controllers/books.controller';
import { AddBookDto, UpdatebookDto } from '@dtos/books.dto';
import { Routes } from '@interfaces/routes.interface';
import { ValidationMiddleware } from '@middlewares/validation.middleware';

import uploadBook from '@/middlewares/uploadBooks.middleware';
import { CookieGuard } from '../middlewares/cookie.guard';
import { RoleGuard } from '../middlewares/role.guard';

export class BookRoute implements Routes {
  public path = '/books';
  public router = Router();
  public book = new BookController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`,CookieGuard,RoleGuard(), this.book.getBooks);// get all books
    this.router.get(`${this.path}/:id`,CookieGuard,RoleGuard(), this.book.getBookById); // get book by id
    this.router.post(`${this.path}`, CookieGuard,RoleGuard(["modo","admin"]),uploadBook,ValidationMiddleware(AddBookDto), this.book.addBook); // add book
    this.router.put(`${this.path}/:id`, CookieGuard,RoleGuard(["modo","admin"]), ValidationMiddleware(UpdatebookDto, true), this.book.updateBook); // update book
    this.router.delete(`${this.path}/:id`,CookieGuard,RoleGuard(["modo","admin"]), this.book.deleteBook); // delete book
    this.router.get(`${this.path}_totalBooks`, CookieGuard,RoleGuard(), this.book.numberOfBook); // total de livres présents dans la bdd

    this.router.get(`${this.path}_download/:id`,CookieGuard,RoleGuard(),this.book.downloadBook)
  }
}
