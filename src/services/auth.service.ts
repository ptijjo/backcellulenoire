import { PrismaClient } from '@prisma/client';
import { compare } from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { Service } from 'typedi';
import { HttpException } from '@/exceptions/httpException';
import { User } from '@interfaces/users.interface';
import { AuthInterface } from '@/interfaces/auth.interface';
import { SECRET_KEY } from '@/config';

@Service()
export class AuthService {
  public user = new PrismaClient().user;

  public async login(userData: AuthInterface): Promise<string> {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (regexEmail.test(userData.identifiant)) {
      const findEmail: User | null = await this.user.findUnique({ where: { email: userData.identifiant } });

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

      return jwt.sign(payload, SECRET_KEY as string, { expiresIn: '7d' });
    } else {
      const findPseudo: User = await this.user.findUnique({ where: { pseudo: userData.identifiant } });
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

      return jwt.sign(payload, SECRET_KEY as string, { expiresIn: '7d' });
    }
  }
}
