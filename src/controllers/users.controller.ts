import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { User } from '@interfaces/users.interface';
import { UserService } from '@services/users.service';
import { CreateUserDto, ForgetPasswordDto, InvitationUserDto, UpdateUserDto, UpdateUserRoleDto } from '@/dtos/users.dto';
import { TokenService } from '@/services/token.service';
import { ROLE } from '@prisma/client';
import { HttpException } from '@/exceptions/httpException';
import { PaginatedResponse } from '@/interfaces/pagination.interface';
import { parsePaginationParams } from '@/utils/pagination';
import { sanitizeUser, sanitizeUsers } from '@/utils/sanitize';

export class UserController {
  public user = Container.get(UserService);
  public token = Container.get(TokenService);

  public getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, itemPerPage } = parsePaginationParams(req.query.page, req.query.itemPerPage);
      const search = (req.query.search as string) || '';

      if (req.user.role !== ROLE.admin && req.user.role !== ROLE.modo) {
        throw new HttpException(404, 'Opération non authorisée !');
      }

      const findAllUsersData: PaginatedResponse<User> = await this.user.findAllUser(search, page, itemPerPage);

      res.status(200).json({
        data: sanitizeUsers(findAllUsersData.data),
        pagination: findAllUsersData.pagination,
        message: 'findAll',
      });
    } catch (error) {
      next(error);
    }
  };

  public getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = String(req.params.id);

      if (req.user.role !== ROLE.admin && req.user.role !== ROLE.modo) {
        throw new HttpException(404, 'Opération non authorisée !');
      }

      const findOneUserData: User = await this.user.findUserById(userId);

      res.status(200).json({ data: sanitizeUser(findOneUserData), message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public inviteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data: InvitationUserDto = req.body;

      if (req.user.role !== ROLE.admin && req.user.role !== ROLE.modo) {
        throw new HttpException(404, 'Opération non authorisée !');
      }

      await this.user.invitation(data);

      res.status(200).json({ message: 'Invitation envoyée avec succès' });
    } catch (error) {
      next(error);
    }
  };

  public createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: CreateUserDto = req.body;
      const decodedToken = await this.token.tokenInvitation(req.params.id);

      userData.email = decodedToken.email;
      userData.idInvitation = decodedToken.idInvitation;

      const createUserData: User = await this.user.createUser(userData);

      res.status(201).json({ data: createUserData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = String(req.params.id);
      const userData: UpdateUserDto = req.body;

      if ((req.user.id !== userId && req.user.role === ROLE.user) || (req.user.id !== userId && req.user.role === ROLE.new)) {
        throw new HttpException(404, 'Opération non authorisée !');
      }
      const updateUserData: User = await this.user.updateUser(userId, userData);

      res.status(200).json({ data: updateUserData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = String(req.params.id);

      if (req.user.role !== ROLE.admin && req.user.role !== ROLE.modo) {
        throw new HttpException(404, 'Opération non authorisée !');
      }

      const deleteUserData: User = await this.user.deleteUser(userId);

      res.status(200).json({ data: deleteUserData, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };

  public updateUserRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = String(req.params.id);
      const userData: UpdateUserRoleDto = req.body;

      if (req.user.role !== ROLE.admin) {
        throw new HttpException(404, 'Opération non authorisée !');
      }

      const updateUserData: User = await this.user.updateUserRole(userId, userData);

      res.status(200).json({ data: updateUserData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: ForgetPasswordDto = req.body;
      const decodedToken = await this.token.tokenInvitation(req.params.id);
      const email = decodedToken.email;

      await this.user.resetPassword(email, userData);

      res.status(200).json({ message: 'Mot de passe mis à jour avec succès' });
    } catch (error) {
      next(error);
    }
  };

  public forgetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data: InvitationUserDto = req.body;
      await this.user.forgetPassword(data.email);

      res.status(200).json({
        message: 'Si cette adresse email est enregistrée, un lien de réinitialisation vous sera envoyé.',
      });
    } catch (error) {
      next(error);
    }
  };

  public decodeToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(400).json({ message: 'User ID manquant dans le token' });
        return;
      }

      const findOneUserData: User = await this.user.findUserSession(userId);
      res.status(200).json(sanitizeUser(findOneUserData));
    } catch (error) {
      next(error);
    }
  };
}
