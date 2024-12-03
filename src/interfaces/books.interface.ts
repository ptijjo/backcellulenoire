/* eslint-disable prettier/prettier */
export interface Book {
  id?: string;
  title: string;
  url: string;
  author: string;
  categoryId: string;
  uploadedAt?: Date;
}
