import path from 'path';

export function extractBookFilename(storedUrl: string): string {
  if (storedUrl.includes('/books/')) {
    return storedUrl.split('/books/')[1]?.split('?')[0] ?? '';
  }

  return storedUrl.split('?')[0];
}

export function resolveBookFilePath(storedUrl: string): string {
  const filename = extractBookFilename(storedUrl);
  return path.resolve(process.cwd(), 'public', 'books', filename);
}

export function sanitizePdfFilename(title: string): string {
  return `${title.replace(/[^\w\s\-àâäéèêëïîôùûüç]/gi, '').trim() || 'livre'}.pdf`;
}
