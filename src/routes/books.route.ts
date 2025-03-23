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
    this.router.get(`${this.path}`,auth, this.book.getBooks);// get all books
    this.router.get(`${this.path}/:id`, auth, this.book.getBookById); // get book by id
    this.router.post(`${this.path}`, modo,uploadBook,ValidationMiddleware(AddBookDto), this.book.addBook); // add book
    this.router.put(`${this.path}/:id`, modo, ValidationMiddleware(UpdatebookDto, true), this.book.updateBook); // update book
    this.router.delete(`${this.path}/:id`, modo, this.book.deleteBook); // delete book
    this.router.get(`${this.path}_totalBooks`, auth, this.book.numberOfBook); // total de livres présents dans la bdd

    this.router.get(`${this.path}_download/:id`,auth,this.book.downloadBook)
  }
}
