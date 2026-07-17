/* eslint-disable prettier/prettier */
import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { Book } from '@interfaces/books.interface';
import { BookService } from '@services/books.service';
import { CATEGORY, ROLE } from '@prisma/client';
import { AddBookDto, ToggleBookPublishDto, UpdatebookDto } from '@/dtos/books.dto';
import { HttpException } from '@/exceptions/httpException';
import { PaginatedResponse } from '@/interfaces/pagination.interface';
import { parsePaginationParams } from '@/utils/pagination';
import { sanitizeBook, sanitizeBooks } from '@/utils/sanitize';
import { assignMemoryFilename } from '@/middlewares/uploadBooks.middleware';

export class BookController {
  public book = Container.get(BookService);

  public getBooks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, itemPerPage } = parsePaginationParams(req.query.page, req.query.itemPerPage);
      const search = (req.query.search as string) || '';
      const filtre = (req.query.filtre as CATEGORY) || undefined;

      const isStaff = req.user.role === ROLE.admin || req.user.role === ROLE.modo;

      const findAllBookData: PaginatedResponse<Book> = await this.book.findAllbook(
        search,
        page,
        itemPerPage,
        filtre,
        isStaff,
      );

      res.status(200).json({
        data: sanitizeBooks(findAllBookData.data),
        pagination: findAllBookData.pagination,
        message: 'findAll',
      });
    } catch (error) {
      next(error);
    }
  };

  public getBookById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const BookId = String(req.params.id);
      const findOneUserData: Book = await this.book.findBookById(BookId);

      res.status(200).json({ data: sanitizeBook(findOneUserData), message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public addBook = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
      const bookData: AddBookDto = req.body;
      if (!req.file) throw new HttpException(400, 'Fichier PDF obligatoire');

      assignMemoryFilename(req.file);
      const category: CATEGORY = req.body.categoryName;

      if (req.user.role !== ROLE.admin && req.user.role !== ROLE.modo) {
        throw new HttpException(404, 'Opération non authorisée !');
      }

      const addBookData: Book = await this.book.addBook(bookData, category, req.file);

      res.status(201).json({ data: sanitizeBook(addBookData), message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public updateBook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const bookId = String(req.params.id);
      const bookData: UpdatebookDto = req.body;

      if (req.user.role !== ROLE.admin && req.user.role !== ROLE.modo) {
        throw new HttpException(404, 'Opération non authorisée !');
      }

      const updateBookData: Book = await this.book.updatebook(bookId, bookData);

      res.status(200).json({ data: sanitizeBook(updateBookData), message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteBook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const bookId = String(req.params.id);

      if (req.user.role !== ROLE.admin && req.user.role !== ROLE.modo) {
        throw new HttpException(404, 'Opération non authorisée !');
      }

      const deleteBookData: Book = await this.book.deletebook(bookId);

      res.status(200).json({ data: sanitizeBook(deleteBookData), message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };

  public getHomeOverview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const overview = await this.book.getHomeOverview();
      res.status(200).json({
        data: {
          featuredBook: overview.featuredBook ? sanitizeBook(overview.featuredBook) : null,
          recentBooks: sanitizeBooks(overview.recentBooks),
          categoryCounts: overview.categoryCounts,
        },
        message: 'home',
      });
    } catch (error) {
      next(error);
    }
  };

  public togglePublish = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const bookId = String(req.params.id);
      const { isPublished }: ToggleBookPublishDto = req.body;
      const updatedBook = await this.book.togglePublish(bookId, isPublished);
      res.status(200).json({ data: sanitizeBook(updatedBook), message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public setFeatured = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const bookId = String(req.params.id);
      const updatedBook = await this.book.setFeatured(bookId);
      res.status(200).json({ data: sanitizeBook(updatedBook), message: 'featured' });
    } catch (error) {
      next(error);
    }
  };

  public numberOfBook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const search = (req.query.search as string) || '';
      const filtre = (req.query.filtre as CATEGORY) || undefined;
      const nbBookTotal: number = await this.book.numberOfBook(search, filtre);

      res.status(200).json({ data: nbBookTotal, message: 'numbers of book' });
    } catch (error) {
      next(error);
    }
  };

  public downloadBook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const bookId: string = req.params.id as string;
      const userId: string = req.user.id;

      const download = await this.book.downloadBook(bookId, userId);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${download.fileName}"`);

      if (download.filePath) {
        res.download(download.filePath, download.fileName, err => {
          if (err) {
            next(new HttpException(500, 'Erreur lors du téléchargement du fichier'));
          }
        });
        return;
      }

      download.stream.on('error', () => {
        next(new HttpException(500, 'Erreur lors du téléchargement du fichier'));
      });
      download.stream.pipe(res);
    } catch (error) {
      next(error);
    }
  };
}
