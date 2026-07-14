import { Prisma, ROLE } from '@prisma/client';
import { Service } from 'typedi';
import { CreateUserDto, ForgetPasswordDto, InvitationUserDto, UpdateUserDto, UpdateUserRoleDto } from '@dtos/users.dto';
import { HttpException } from '@/exceptions/httpException';
import { User } from '@interfaces/users.interface';
import { sendMailActivation, sendResetPassword } from '@/mails/user/user.mail';
import cuid from '@bugsnag/cuid';
import jwt from 'jsonwebtoken';
import { FRONT_END, LINK_PASSWORD, SECRET_KEY_INVITATION } from '@/config';
import bcrypt from 'bcrypt';
import { PaginatedResponse } from '@/interfaces/pagination.interface';
import { buildPaginationMeta } from '@/utils/pagination';
import { prisma } from '@/utils/prisma';
import { sanitizeUser } from '@/utils/sanitize';

const userListSelect = {
  id: true,
  email: true,
  pseudo: true,
  avatar: true,
  role: true,
  download: true,
  createdAt: true,
  _count: {
    select: {
      downloaded: true,
    },
  },
} satisfies Prisma.UserSelect;

@Service()
export class UserService {
  private buildUserWhereClause(search: string): Prisma.UserWhereInput {
    return {
      OR: [{ pseudo: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }],
    };
  }

  public async findAllUser(search: string, page: number, itemPerPage: number): Promise<PaginatedResponse<User>> {
    const skip = (page - 1) * itemPerPage;
    const take = itemPerPage;
    const where = this.buildUserWhereClause(search);

    const [allUser, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take,
        where,
        orderBy: { createdAt: 'desc' },
        select: userListSelect,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: allUser as User[],
      pagination: buildPaginationMeta(page, itemPerPage, total),
    };
  }

  public async findUserById(userId: string): Promise<User> {
    const findUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        downloaded: true,
      },
    });
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    return findUser;
  }

  public async findUserSession(userId: string): Promise<User> {
    const findUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        pseudo: true,
        avatar: true,
        role: true,
        download: true,
        createdAt: true,
      },
    });
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    return findUser as User;
  }

  public async invitation(invitationData: InvitationUserDto): Promise<void> {
    const findUser = await prisma.user.findUnique({ where: { email: invitationData.email } });
    if (findUser) throw new HttpException(409, 'Cette adresse email est déjà utilisée');

    const idInvitation = cuid();

    const tokenInvitation = jwt.sign(
      {
        email: invitationData.email,
        idInvitation,
      },
      SECRET_KEY_INVITATION as string,
      { expiresIn: '1h' },
    );

    const link = `${FRONT_END}/${tokenInvitation}`;
    await sendMailActivation(invitationData.email, link);
  }

  public async createUser(userData: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        pseudo: `user${userData.idInvitation}`,
        idInvitation: userData.idInvitation,
      },
    });

    return sanitizeUser(newUser) as User;
  }

  public async updateUser(userId: string, userData: UpdateUserDto): Promise<User> {
    const findUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    const findPseudo = await prisma.user.findUnique({ where: { pseudo: userData.pseudo } });
    if (findPseudo && findPseudo.id !== userId) throw new HttpException(409, 'Pseudo already exist');

    const updateUserData = await prisma.user.update({ where: { id: userId }, data: { ...userData } });
    return sanitizeUser(updateUserData) as User;
  }

  public async updateUserRole(userId: string, userData: UpdateUserRoleDto): Promise<User> {
    const findUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    const updateUserData = await prisma.user.update({
      where: { id: userId },
      data: {
        role: userData.role,
      },
    });
    return sanitizeUser(updateUserData) as User;
  }

  public async deleteUser(userId: string): Promise<User> {
    const findUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    const deleteUserData = await prisma.user.delete({ where: { id: userId } });
    return sanitizeUser(deleteUserData) as User;
  }

  public async resetPassword(email: string, userData: ForgetPasswordDto): Promise<void> {
    const findUser = await prisma.user.findUnique({ where: { email } });
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    const hashPassword = await bcrypt.hash(userData.password, 10);

    await prisma.user.update({
      where: {
        email: findUser.email,
      },
      data: {
        password: hashPassword,
      },
    });
  }

  public async forgetPassword(email: string): Promise<void> {
    const findUser = await prisma.user.findUnique({ where: { email } });
    if (!findUser) return;

    const tokenInvitation = jwt.sign(
      {
        email,
      },
      SECRET_KEY_INVITATION as string,
      { expiresIn: '1h' },
    );

    const link = `${LINK_PASSWORD}/${tokenInvitation}`;
    await sendResetPassword(email, link);
  }
}
