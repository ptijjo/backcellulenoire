import { Request } from 'express';
import { randomUUID } from 'crypto';
import { mkdirSync } from 'fs';
import { join } from 'path';
import multer, { FileFilterCallback } from 'multer';
import { STORAGE_DRIVER } from '@/config';

const MIME_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
};

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 Mo

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers PDF sont autorisés'));
  }
};

const filename = (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
  const extension = MIME_TYPES[file.mimetype] || 'pdf';
  cb(null, `${randomUUID()}.${extension}`);
};

const storage =
  STORAGE_DRIVER === 's3'
    ? multer.memoryStorage()
    : multer.diskStorage({
        destination: (_req, _file, cb) => {
          const uploadPath = join(process.cwd(), 'public', 'books');
          mkdirSync(uploadPath, { recursive: true });
          cb(null, uploadPath);
        },
        filename,
      });

const uploadBook = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
}).single('url');

export default uploadBook;

export const assignMemoryFilename = (file: Express.Multer.File): void => {
  if (!file.filename) {
    const extension = MIME_TYPES[file.mimetype] || 'pdf';
    file.filename = `${randomUUID()}.${extension}`;
  }
};
