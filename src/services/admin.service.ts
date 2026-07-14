import { CATEGORY } from '@prisma/client';
import { Service } from 'typedi';
import { prisma } from '@/utils/prisma';

export interface AdminDashboardStats {
  totals: {
    books: number;
    publishedBooks: number;
    unpublishedBooks: number;
    users: number;
    downloadsThisMonth: number;
    newUsersThisMonth: number;
  };
  topDownloadedBooks: Array<{
    id: string;
    title: string;
    author: string;
    category: CATEGORY;
    downloadCount: number;
    isPublished: boolean;
    isFeatured: boolean;
  }>;
  activeUsers: Array<{
    id: string;
    pseudo: string;
    role: string;
    downloadCount: number;
  }>;
  emptyCategories: Array<{
    id: string;
    type: CATEGORY;
  }>;
  unpublishedBooks: Array<{
    id: string;
    title: string;
    author: string;
  }>;
}

@Service()
export class AdminService {
  public async getDashboardStats(): Promise<AdminDashboardStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      books,
      publishedBooks,
      unpublishedBooks,
      users,
      downloadsThisMonth,
      newUsersThisMonth,
      topBooksRaw,
      activeDownloadsGrouped,
      categories,
      unpublishedBooksList,
    ] = await Promise.all([
      prisma.book.count(),
      prisma.book.count({ where: { isPublished: true } }),
      prisma.book.count({ where: { isPublished: false } }),
      prisma.user.count(),
      prisma.download.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.book.findMany({
        take: 5,
        orderBy: { downloaded: { _count: 'desc' } },
        include: {
          category: true,
          _count: { select: { downloaded: true } },
        },
      }),
      prisma.download.groupBy({
        by: ['userId'],
        where: { createdAt: { gte: thirtyDaysAgo } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
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
      prisma.book.findMany({
        where: { isPublished: false },
        select: { id: true, title: true, author: true },
        orderBy: { uploadedAt: 'desc' },
        take: 10,
      }),
    ]);

    const activeUserIds = activeDownloadsGrouped.map(item => item.userId);
    const activeUsersRaw =
      activeUserIds.length > 0
        ? await prisma.user.findMany({
            where: { id: { in: activeUserIds } },
            select: { id: true, pseudo: true, role: true },
          })
        : [];

    const activeUsersMap = new Map(activeUsersRaw.map(user => [user.id, user]));

    return {
      totals: {
        books,
        publishedBooks,
        unpublishedBooks,
        users,
        downloadsThisMonth,
        newUsersThisMonth,
      },
      topDownloadedBooks: topBooksRaw.map(book => ({
        id: book.id,
        title: book.title,
        author: book.author,
        category: book.category.type,
        downloadCount: book._count.downloaded,
        isPublished: book.isPublished,
        isFeatured: book.isFeatured,
      })),
      activeUsers: activeDownloadsGrouped
        .map(item => {
          const user = activeUsersMap.get(item.userId);
          if (!user) return null;
          return {
            id: user.id,
            pseudo: user.pseudo,
            role: user.role,
            downloadCount: item._count.id,
          };
        })
        .filter((user): user is NonNullable<typeof user> => user !== null),
      emptyCategories: categories
        .filter(category => category._count.books === 0)
        .map(category => ({ id: category.id, type: category.type })),
      unpublishedBooks: unpublishedBooksList,
    };
  }
}
