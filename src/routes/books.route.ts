/* eslint-disable prettier/prettier */
import { Router } from 'express';
import { BookController } from '@controllers/books.controller';
import { AddBookDto, ToggleBookPublishDto, UpdatebookDto } from '@dtos/books.dto';
import { Routes } from '@interfaces/routes.interface';
import { ValidationMiddleware } from '@middlewares/validation.middleware';

import uploadBook from '@/middlewares/uploadBooks.middleware';
import { CookieGuard } from '../middlewares/cookie.guard';
import { RoleGuard } from '../middlewares/role.guard';
import { downloadRateLimiter, uploadRateLimiter } from '@/middlewares/rateLimit.middleware';

export class BookRoute implements Routes {
  public path = '/books';
  public router = Router();
  public book = new BookController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}_home`, CookieGuard, RoleGuard(), this.book.getHomeOverview);
    this.router.get(`${this.path}`, CookieGuard, RoleGuard(), this.book.getBooks);
    this.router.get(`${this.path}_totalBooks`, CookieGuard, RoleGuard(), this.book.numberOfBook);
    this.router.get(`${this.path}_download/:id`, CookieGuard, RoleGuard(), downloadRateLimiter, this.book.downloadBook);
    this.router.patch(
      `${this.path}_publish/:id`,
      CookieGuard,
      RoleGuard(['modo', 'admin']),
      ValidationMiddleware(ToggleBookPublishDto),
      this.book.togglePublish,
    );
    this.router.patch(`${this.path}_featured/:id`, CookieGuard, RoleGuard(['modo', 'admin']), this.book.setFeatured);
    this.router.get(`${this.path}/:id`, CookieGuard, RoleGuard(), this.book.getBookById);
    this.router.post(
      `${this.path}`,
      CookieGuard,
      RoleGuard(['modo', 'admin']),
      uploadRateLimiter,
      uploadBook,
      ValidationMiddleware(AddBookDto),
      this.book.addBook,
    );
    this.router.put(`${this.path}/:id`, CookieGuard, RoleGuard(['modo', 'admin']), ValidationMiddleware(UpdatebookDto, true), this.book.updateBook);
    this.router.delete(`${this.path}/:id`, CookieGuard, RoleGuard(['modo', 'admin']), this.book.deleteBook);
  }
}
