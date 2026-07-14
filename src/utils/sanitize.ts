import { Book } from '@interfaces/books.interface';
import { User } from '@interfaces/users.interface';

export type PublicUser = Omit<User, 'password' | 'idInvitation'>;

export function sanitizeUser<T extends { password?: string; idInvitation?: string }>(
  user: T,
): Omit<T, 'password' | 'idInvitation'> {
  const { password: _password, idInvitation: _idInvitation, ...safeUser } = user;
  return safeUser;
}

export function sanitizeUsers<T extends { password?: string; idInvitation?: string }>(users: T[]): Omit<T, 'password' | 'idInvitation'>[] {
  return users.map(sanitizeUser);
}

export function sanitizeBook(book: Book): Omit<Book, 'url'> {
  const { url: _url, ...safeBook } = book;
  return safeBook;
}

export function sanitizeBooks(books: Book[]): Omit<Book, 'url'>[] {
  return books.map(sanitizeBook);
}
