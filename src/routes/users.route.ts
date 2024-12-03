import { Router } from 'express';
import { UserController } from '@controllers/users.controller';
import { CreateUserDto, InvitationUserDto } from '@dtos/users.dto';
import { Routes } from '@interfaces/routes.interface';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import { modo } from '@/middlewares/modo';
import { auth } from '@/middlewares/auth';
import uploadAvatar from '@/middlewares/avatar.middleware';

export class UserRoute implements Routes {
  public path = '/users';
  public router = Router();
  public user = new UserController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, modo, this.user.getUsers);
    this.router.get(`${this.path}/:id`, auth, this.user.getUserById);
    this.router.post(`${this.path}/:id`, ValidationMiddleware(CreateUserDto), this.user.createUser);
    this.router.post(`${this.path}`, ValidationMiddleware(InvitationUserDto), this.user.inviteUser);
    this.router.post(`${this.path}_connection`, this.user.connectUser);
    this.router.put(`${this.path}/:id`, auth, ValidationMiddleware(CreateUserDto, true), this.user.updateUser);
    this.router.put(`${this.path}_updateAvatar/:id`, auth, uploadAvatar, ValidationMiddleware(CreateUserDto, true), this.user.updateUserAvatar);
    this.router.put(`${this.path}_updateRole/:id`, modo, ValidationMiddleware(CreateUserDto, true), this.user.updateUserRole);
    this.router.delete(`${this.path}/:id`, modo, this.user.deleteUser);

    this.router.get(`${this.path}_decodage`, auth, this.user.decodageToken); // Décodage du token
  }
}
