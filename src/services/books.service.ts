import { CATEGORY, Prisma } from '@prisma/client';
import { Service } from 'typedi';
import { AddBookDto, UpdatebookDto } from '@dtos/books.dto';
import { HttpException } from '@/exceptions/httpException';
import { Book, BookHomeOverview } from '@interfaces/books.interface';
import { User } from '@interfaces/users.interface';
import fs from 'fs/promises';
import { PaginatedResponse } from '@/interfaces/pagination.interface';
import { buildPaginationMeta } from '@/utils/pagination';
import { prisma } from '@/utils/prisma';
import { extractBookFilename, resolveBookFilePath, sanitizePdfFilename } from '@/utils/bookFile';
import { sanitizeUser } from '@/utils/sanitize';

@Service()
export class BookService {
  private async buildBookWhereClause(
    search: string,
    filtre?: CATEGORY,
    includeUnpublished = false,
  ): Promise<Prisma.BookWhereInput> {
    let categoryFilterCondition: Prisma.BookWhereInput = {};

    if (filtre) {
      const findCategory = await prisma.category.findUnique({
        where: {
          type: filtre as CATEGORY,
        },
      });

      if (findCategory === null) {
        throw new HttpException(409, "category doesn't exist");
      }
      categoryFilterCondition = {
        categoryId: findCategory.id,
      };
    }

    const conditions: Prisma.BookWhereInput[] = [
      {
        OR: [{ title: { contains: search, mode: 'insensitive' } }, { author: { contains: search, mode: 'insensitive' } }],
      },
      categoryFilterCondition,
    ];

    if (!includeUnpublished) {
      conditions.push({ isPublished: true });
    }

    return { AND: conditions };
  }

  public async findAllbook(
    search: string,
    page: number,
    itemPerPage: number,
    filtre?: CATEGORY,
    includeUnpublished = false,
  ): Promise<PaginatedResponse<Book>> {
    const skip = (page - 1) * itemPerPage;
    const take = itemPerPage;
    const where = await this.buildBookWhereClause(search, filtre, includeUnpublished);

    const [allBook, total] = await Promise.all([
      prisma.book.findMany({
        skip,
        take,
        where,
        orderBy: { uploadedAt: 'desc' },
        include: {
          category: true,
        },
      }),
      prisma.book.count({ where }),
    ]);

    return {
      data: allBook,
      pagination: buildPaginationMeta(page, itemPerPage, total),
    };
  }

  public async findBookById(bookId: string): Promise<Book> {
    const findBook: Book | null = await prisma.book.findUnique({ where: { id: bookId } });
    if (!findBook) throw new HttpException(409, "book doesn't exist");

    return findBook;
  }

  public async addBook(bookData: AddBookDto, categoryName: string, filename: string): Promise<Book> {
    const findCategory = await prisma.category.findUnique({
      where: {
        type: categoryName as CATEGORY,
      },
    });

    if (!findCategory) throw new HttpException(409, "category doesn't exist");

    const newbook: Book = await prisma.book.create({
      data: {
        title: bookData.title,
        url: filename,
        author: bookData.author,
        categoryId: findCategory.id,
      },
    });

    return newbook;
  }

  public async updatebook(bookId: string, bookData: UpdatebookDto): Promise<Book> {
    const findBook: Book | null = await prisma.book.findUnique({ where: { id: bookId } });
    if (!findBook) throw new HttpException(409, "book doesn't exist");

    const findCategory = await prisma.category.findUnique({
      where: {
        type: bookData.categorie as CATEGORY,
      },
    });

    if (!findCategory) throw new HttpException(409, "category doesn't exist");

    const updateBookData = await prisma.book.update({
      where: { id: bookId },
      data: {
        title: bookData.title,
        author: bookData.author,
        categoryId: findCategory.id,
      },
    });
    return updateBookData;
  }

  public async deletebook(bookId: string): Promise<Book> {
    const findBook: Book | null = await prisma.book.findUnique({ where: { id: bookId } });
    if (!findBook) throw new HttpException(409, "book doesn't exist");

    const filename = extractBookFilename(findBook.url);
    if (!filename) throw new HttpException(409, 'URL du livre invalide');
    const filePath = resolveBookFilePath(findBook.url);

    await fs.unlink(filePath);

    const deleteBookData = await prisma.book.delete({ where: { id: bookId } });
    return deleteBookData;
  }

  public async numberOfBook(search = '', filtre?: CATEGORY, includeUnpublished = false): Promise<number> {
    const where = await this.buildBookWhereClause(search, filtre, includeUnpublished);
    return prisma.book.count({ where });
  }

  public async getHomeOverview(): Promise<BookHomeOverview> {
    const [featuredBook, recentBooks, categories] = await Promise.all([
      prisma.book.findFirst({
        where: { isPublished: true, isFeatured: true },
        include: { category: true },
        orderBy: { uploadedAt: 'desc' },
      }),
      prisma.book.findMany({
        where: { isPublished: true },
        include: { category: true },
        orderBy: { uploadedAt: 'desc' },
        take: 4,
      }),
      prisma.category.findMany({
        include: {
          _count: {
            select: {
              books: { where: { isPublished: true } },
            },
          },
        },
      }),
    ]);

    return {
      featuredBook,
      recentBooks,
      categoryCounts: categories
        .map(category => ({
          type: category.type,
          count: category._count.books,
        }))
        .filter(category => category.count > 0),
    };
  }

  public async togglePublish(bookId: string, isPublished: boolean): Promise<Book> {
    const findBook = await prisma.book.findUnique({ where: { id: bookId } });
    if (!findBook) throw new HttpException(409, "book doesn't exist");

    if (!isPublished && findBook.isFeatured) {
      return prisma.book.update({
        where: { id: bookId },
        data: { isPublished: false, isFeatured: false },
        include: { category: true },
      });
    }

    return prisma.book.update({
      where: { id: bookId },
      data: { isPublished },
      include: { category: true },
    });
  }

  public async setFeatured(bookId: string): Promise<Book> {
    const findBook = await prisma.book.findUnique({ where: { id: bookId } });
    if (!findBook) throw new HttpException(409, "book doesn't exist");
    if (!findBook.isPublished) throw new HttpException(409, 'Seuls les livres publiés peuvent être mis en avant');

    await prisma.book.updateMany({
      where: { isFeatured: true },
      data: { isFeatured: false },
    });

    return prisma.book.update({
      where: { id: bookId },
      data: { isFeatured: true, isPublished: true },
      include: { category: true },
    });
  }

  public async downloadBook(
    bookId: string,
    userId: string,
  ): Promise<{ filePath: string; fileName: string; updateUser: ReturnType<typeof sanitizeUser<User>> }> {
    const findBook = await prisma.book.findUnique({ where: { id: bookId } });
    if (!findBook) throw new HttpException(409, "book doesn't exist");
    if (!findBook.isPublished) throw new HttpException(404, "Ce livre n'est pas disponible");

    const filename = extractBookFilename(findBook.url);
    if (!filename) throw new HttpException(409, 'URL du livre invalide');
    const filePath = resolveBookFilePath(findBook.url);

    try {
      await fs.access(filePath);
    } catch {
      throw new HttpException(409, 'Fichier introuvable');
    }

    const updateUser = await prisma.$transaction(async tx => {
      let findUser = await tx.user.findUnique({ where: { id: userId } });
      if (!findUser) throw new HttpException(409, "user doesn't exist");

      const lastDownload = await tx.download.findFirst({
        where: { userId: findUser.id },
        orderBy: { createdAt: 'desc' },
      });

      if (lastDownload) {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        if (lastDownload.createdAt < oneMonthAgo) {
          findUser = await tx.user.update({
            where: { id: findUser.id },
            data: { download: 0 },
          });
        }
      }

      if (findUser.role === 'new' && findUser.download >= 1) {
        throw new HttpException(404, "Vous ne pouvez télécharger qu'un livre par mois");
      }

      await tx.download.create({
        data: {
          userId: findUser.id,
          bookId,
        },
      });

      return tx.user.update({
        where: { id: findUser.id },
        data: {
          download: {
            increment: 1,
          },
        },
      });
    });

    return {
      filePath,
      fileName: sanitizePdfFilename(findBook.title),
      updateUser: sanitizeUser(updateUser),
    };
  }
}
