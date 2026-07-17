import { createReadStream, createWriteStream } from 'fs';
import fs from 'fs/promises';
import path from 'path';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import {
  AWS_ACCESS_KEY_ID,
  AWS_REGION,
  AWS_S3_BUCKET,
  AWS_SECRET_ACCESS_KEY,
  STORAGE_DRIVER,
} from '@/config';
import { HttpException } from '@/exceptions/httpException';
import { extractBookFilename, resolveBookFilePath } from '@/utils/bookFile';

export type StoredBookRef = string;

const booksDir = () => path.resolve(process.cwd(), 'public', 'books');

const isS3Ref = (storedUrl: string) => storedUrl.startsWith('s3://');

const getS3Client = (): S3Client => {
  if (!AWS_REGION || !AWS_S3_BUCKET || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
    throw new HttpException(500, 'Configuration S3 incomplète');
  }

  return new S3Client({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
  });
};

const s3Key = (filename: string) => `books/${filename}`;

export async function persistUploadedBook(file: Express.Multer.File): Promise<StoredBookRef> {
  const filename = file.filename;

  if (STORAGE_DRIVER === 's3') {
    const client = getS3Client();
    const body = file.buffer ?? (await fs.readFile(file.path));

    await client.send(
      new PutObjectCommand({
        Bucket: AWS_S3_BUCKET,
        Key: s3Key(filename),
        Body: body,
        ContentType: 'application/pdf',
      }),
    );

    if (file.path) {
      await fs.unlink(file.path).catch(() => undefined);
    }

    return `s3://${AWS_S3_BUCKET}/${s3Key(filename)}`;
  }

  if (!file.path) {
    await fs.mkdir(booksDir(), { recursive: true });
    const dest = path.join(booksDir(), filename);
    await fs.writeFile(dest, file.buffer);
  }

  return filename;
}

export async function deleteStoredBook(storedUrl: string): Promise<void> {
  if (isS3Ref(storedUrl)) {
    const filename = extractBookFilename(storedUrl);
    if (!filename) return;

    const client = getS3Client();
    await client.send(
      new DeleteObjectCommand({
        Bucket: AWS_S3_BUCKET,
        Key: s3Key(filename),
      }),
    );
    return;
  }

  const filePath = resolveBookFilePath(storedUrl);
  await fs.unlink(filePath).catch(() => undefined);
}

export async function openStoredBookStream(storedUrl: string): Promise<{ stream: Readable; filePath?: string }> {
  if (isS3Ref(storedUrl)) {
    const filename = extractBookFilename(storedUrl);
    if (!filename) throw new HttpException(409, 'URL du livre invalide');

    const client = getS3Client();
    const response = await client.send(
      new GetObjectCommand({
        Bucket: AWS_S3_BUCKET,
        Key: s3Key(filename),
      }),
    );

    if (!response.Body) throw new HttpException(409, 'Fichier introuvable');

    return { stream: response.Body as Readable };
  }

  const filePath = resolveBookFilePath(storedUrl);
  try {
    await fs.access(filePath);
  } catch {
    throw new HttpException(409, 'Fichier introuvable');
  }

  return { stream: createReadStream(filePath), filePath };
}

/** Cache local temporaire pour compat éventuelle */
export async function ensureLocalBookPath(storedUrl: string): Promise<string> {
  if (!isS3Ref(storedUrl)) {
    const filePath = resolveBookFilePath(storedUrl);
    await fs.access(filePath);
    return filePath;
  }

  const filename = extractBookFilename(storedUrl);
  if (!filename) throw new HttpException(409, 'URL du livre invalide');

  await fs.mkdir(booksDir(), { recursive: true });
  const localPath = path.join(booksDir(), `.cache-${filename}`);

  try {
    await fs.access(localPath);
    return localPath;
  } catch {
    // cache miss
  }

  const { stream } = await openStoredBookStream(storedUrl);
  await pipeline(stream, createWriteStream(localPath));
  return localPath;
}
