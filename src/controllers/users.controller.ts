import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { User } from '@interfaces/users.interface';
import { UserService } from '@services/users.service';
import { ForgetPasswordDto, InvitationUserDto, UpdateUserDto } from '@/dtos/users.dto';
import { TokenService } from '@/services/token.service';
import jwt from 'jsonwebtoken';
import { EXPIRED_TOKEN, SECRET_KEY } from '@/config';
import { sendResetPassword } from '@/mails/user/user.mail';
export class UserController {
  public user = Container.get(UserService);
  public token = Container.get(TokenService);

  public getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1; // Valeur par défaut : 1
      const itemPerPage = parseInt(req.query.itemPerPage as string) || 20; // Valeur par défaut : 20
      const search = (req.query.search as string) || '';
      const findAllUsersData: User[] = await this.user.findAllUser(search, page, itemPerPage);

      res.status(200).json({ data: findAllUsersData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = String(req.params.id);
      const findOneUserData: User = await this.user.findUserById(userId);

      res.status(200).json({ data: findOneUserData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public inviteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data: InvitationUserDto = req.body;
      const inviteUser = await this.user.invitation(data);

      res.status(200).json({ data: inviteUser, message: 'invitation envoyée !' });
    } catch (error) {
      next(error);
    }
  };

  public createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: User = req.body;
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
      const updateUserData: User = await this.user.updateUser(userId, userData);

      res.status(200).json({ data: updateUserData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public connectUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: { identifiant: string; password: string } = req.body;
      const connectUserData: User = await this.user.connectionUser(userData);

      //Creation du token d'authentification

      const token = jwt.sign(
        {
          userId: connectUserData.id,
          userEmail: connectUserData.email,
          userRole: connectUserData.role,
          userPseudo: connectUserData.pseudo,
          userAvatar: connectUserData.avatar,
        },
        SECRET_KEY as string,
        { expiresIn: EXPIRED_TOKEN as string },
      );

      res.status(200).json({ data: connectUserData, token: token, message: 'connected' });
    } catch (error) {
      next(error);
    }
  };

  public deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = String(req.params.id);
      const deleteUserData: User = await this.user.deleteUser(userId);

      res.status(200).json({ data: deleteUserData, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };

  public updateUserRole = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = String(req.params.id);
      const userData: User = req.body;
      const updateUserData: User = await this.user.updateUserRole(userId, userData);

      res.status(200).json({ data: updateUserData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public decodageToken = async (req: any, res: Response, next: NextFunction) => {
    try {
      const id = req.auth.userId;
      const pseudo = req.auth.userPseudo;
      const avatar = req.auth.userAvatar;
      const email = req.auth.userEmail;
      const role = req.auth.userRole;

      res.status(200).json({ pseudo, avatar, id, role, email });
    } catch (error) {
      next(error);
    }
  };

  public resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: ForgetPasswordDto = req.body;
      const decodedToken = await this.token.tokenInvitation(req.params.id);
      const email = decodedToken.email;

      const newPassword: User = await this.user.resetPassword(email, userData);

      res.status(200).json(newPassword);
    } catch (error) {
      next(error);
    }
  };

  public forgetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data: InvitationUserDto = req.body;
      const inviteUser = await this.user.forgetPassword(data.email);

      res.status(200).json({ data: inviteUser, message: 'invitation envoyée !' });
    } catch (error) {
      next(error);
    }
  };
}
