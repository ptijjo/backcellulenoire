import { CATEGORY } from '@prisma/client';

export interface Book {
  id?: string;
  title: string;
  url?: string;
  author: string;
  categoryId: string;
  uploadedAt?: Date;
  isPublished?: boolean;
  isFeatured?: boolean;
  category?: {
    id: string;
    type: CATEGORY | string;
  };
  _count?: {
    downloaded: number;
  };
}

export interface BookHomeOverview {
  featuredBook: Book | null;
  recentBooks: Book[];
  categoryCounts: Array<{
    type: CATEGORY;
    count: number;
  }>;
}
