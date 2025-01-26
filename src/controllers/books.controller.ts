/* eslint-disable prettier/prettier */
import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { Book } from '@interfaces/books.interface';
import { BookService } from '@services/books.service';
import { CATEGORY } from '@prisma/client';
import { AddBookDto, UpdatebookDto } from '@/dtos/books.dto';

export class BookController {
  public book = Container.get(BookService);
  
  //Méthode qui permet de récuperer tous les livres présents dans la bdd 
  public  getBooks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;  // Valeur par défaut : 1
      const itemPerPage = parseInt(req.query.itemPerPage as string) || 20;  // Valeur par défaut : 20
      const search = req.query.search as string || ""; 
      const filtre = req.query.filtre as CATEGORY || "";
      
      const findAllBookData:Book[] = await this.book.findAllbook(search,page,itemPerPage,filtre as CATEGORY);

      res.status(200).json({ data: findAllBookData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  //Méthode qui permet de récuperer un livre en fonction de id
  public  getBookById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const BookId = String(req.params.id);
      const findOneUserData: Book = await this.book.findBookById(BookId);

      res.status(200).json({ data: findOneUserData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

 //Méthode pour ajouter une livre dans la bdd
  public addBook = async (req: any , res: Response, next: NextFunction): Promise<void> => {
    try {
      const bookData: AddBookDto = req.body;
        const url = `${req.protocol}://${req.get('host')}/public/books/${req.file.filename}`.split(' ').join('');
        const category: CATEGORY = req.body.categoryName;

        
      const addBookData: Book = await this.book.addBook(bookData,category,url);

      res.status(201).json({ data: addBookData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };
  //Méthode pour mettre un livre
  public updateBook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const bookId = String(req.params.id);
      const bookData: UpdatebookDto = req.body;
      const updateBookData: Book = await this.book.updatebook(bookId, bookData);

      res.status(200).json({ data: updateBookData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  //Méthode pour supprimer un livre de la bdd
  public deleteBook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const bookId = String(req.params.id);
      const deleteBookData: Book = await this.book.deletebook(bookId);

      res.status(200).json({ data: deleteBookData, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };

  public numberOfBook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const nbBookTotal: number = await this.book.numberOfBook();

      res.status(200).json({data:nbBookTotal, message: "numbers of book"})
    } catch (error) {
      next(error)
    }
  }
}
