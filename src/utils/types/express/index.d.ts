import { Request } from 'express';

export interface AuthRequest extends Request {
  auth?: {
    userId: string;
    userPseudo: string;
    userEmail: string;
    userAvatar: string;
    userRole: string;
    userDownloaded: number;
  };
}
