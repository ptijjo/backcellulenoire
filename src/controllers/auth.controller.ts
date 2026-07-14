import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { AuthService } from '@/services/auth.service';
import { CreateAuthDto } from '../dtos/auth.dto';
import { EXPIRED_TOKEN, HTTP_ONLY } from '@/config';
import { parseDurationToMs } from '@/utils/tokenDuration';

export class AuthController {
  public auth = Container.get(AuthService);

  public logIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: CreateAuthDto = req.body;
      const token: string = await this.auth.login(userData);
      const expiresIn = (EXPIRED_TOKEN as string) || '7d';

      res.cookie('token', token, {
        httpOnly: HTTP_ONLY as unknown as boolean,
        secure: true,
        maxAge: parseDurationToMs(expiresIn),
        sameSite: 'none',
      });

      res.status(200).json({ message: 'connection réussie' });
    } catch (error) {
      next(error);
    }
  };

  public logOut = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.clearCookie('token', {
        httpOnly: HTTP_ONLY as unknown as boolean,
        secure: true,
        sameSite: 'none',
      });

      res.status(200).json({ message: 'logout' });
    } catch (error) {
      next(error);
    }
  };
}
