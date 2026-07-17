import path from 'path';

export function extractBookFilename(storedUrl: string): string {
  if (storedUrl.startsWith('s3://')) {
    const withoutScheme = storedUrl.slice('s3://'.length);
    const slashIndex = withoutScheme.indexOf('/');
    const key = slashIndex >= 0 ? withoutScheme.slice(slashIndex + 1) : withoutScheme;
    return key.replace(/^books\//, '').split('?')[0] ?? '';
  }

  if (storedUrl.includes('/books/')) {
    return storedUrl.split('/books/')[1]?.split('?')[0] ?? '';
  }

  return path.basename(storedUrl.split('?')[0]);
}

export function resolveBookFilePath(storedUrl: string): string {
  const filename = extractBookFilename(storedUrl);
  return path.resolve(process.cwd(), 'public', 'books', filename);
}

export function sanitizePdfFilename(title: string): string {
  return `${title.replace(/[^\w\s\-àâäéèêëïîôùûüç]/gi, '').trim() || 'livre'}.pdf`;
}
