import { compare } from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { Service } from 'typedi';
import { HttpException } from '@/exceptions/httpException';
import { User } from '@interfaces/users.interface';
import { AuthInterface } from '@/interfaces/auth.interface';
import { EXPIRED_TOKEN, SECRET_KEY } from '@/config';
import { prisma } from '@/utils/prisma';

@Service()
export class AuthService {
  public async login(userData: AuthInterface): Promise<string> {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const expiresIn = ((EXPIRED_TOKEN as string) || '7d') as SignOptions['expiresIn'];

    if (regexEmail.test(userData.identifiant)) {
      const findEmail: User | null = await prisma.user.findUnique({ where: { email: userData.identifiant } });

      if (!findEmail) throw new HttpException(409, `Identifiants incorrects !`);

      const isPasswordMatching: boolean = await compare(userData.password, findEmail.password);
      if (!isPasswordMatching) throw new HttpException(409, `Identifiants incorrects !`);

      const payload = {
        id: findEmail.id,
        email: findEmail.email,
        pseudo: findEmail.pseudo,
        role: findEmail.role,
        avatar: findEmail.avatar,
      };

      return jwt.sign(payload, SECRET_KEY as string, { expiresIn });
    }

    const findPseudo = await prisma.user.findUnique({ where: { pseudo: userData.identifiant } });
    if (!findPseudo) throw new HttpException(409, `Identifiants incorrects !`);

    const isPasswordMatching: boolean = await compare(userData.password, findPseudo.password);
    if (!isPasswordMatching) throw new HttpException(409, `Identifiants incorrects !`);

    const payload = {
      id: findPseudo.id,
      email: findPseudo.email,
      pseudo: findPseudo.pseudo,
      role: findPseudo.role,
      avatar: findPseudo.avatar,
    };

    return jwt.sign(payload, SECRET_KEY as string, { expiresIn });
  }
}
