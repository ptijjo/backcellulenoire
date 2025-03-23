/* eslint-disable prettier/prettier */
import jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';
import { SECRET_KEY } from '@config';
import { AuthRequest } from "../utils/types/express/index";


export const admin = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const header = req.header('Authorization');

    if (!header) {
      return res.status(403).json({ error: 'Authorization header is missing' });
    }

    const token = header.split(' ')[1];
    const decodedToken = jwt.verify(token, SECRET_KEY as string) as {
      userId: string;
      userEmail: string;
      userRole: string;
      userPseudo: string;
      userAvatar: string;
      userDownloaded: number;
    };
    const { userId, userEmail, userRole, userAvatar, userPseudo,userDownloaded } = decodedToken;
    req.auth = {
      userId: userId,
      userPseudo: userPseudo,
      userEmail: userEmail,
      userAvatar: userAvatar,
      userRole: userRole,
      userDownloaded:userDownloaded,
    };
    if (userRole !== 'admin') return res.status(403).json({ error: 'Il faut être admin pour continuer' });

    next();
  } catch (error) {
    res.status(401).json({ error });
  }
};