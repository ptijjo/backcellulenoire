import { Router } from 'express';
import { UserController } from '@controllers/users.controller';
import { CreateUserDto, ForgetPasswordDto, InvitationUserDto } from '@dtos/users.dto';
import { Routes } from '@interfaces/routes.interface';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import { modo } from '@/middlewares/modo';
import { auth } from '@/middlewares/auth';
import { admin } from '@/middlewares/admin';

export class UserRoute implements Routes {
  public path = '/users';
  public router = Router();
  public user = new UserController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, modo, this.user.getUsers); // Get all User

    this.router.get(`${this.path}/:id`, auth, this.user.getUserById); //Get User by id

    this.router.post(`${this.path}/:id`, ValidationMiddleware(CreateUserDto), this.user.createUser); // Create User

    this.router.post(`${this.path}`, modo, ValidationMiddleware(InvitationUserDto), this.user.inviteUser); //Inviter User

    this.router.post(`${this.path}_connection`, this.user.connectUser); // Connection

    this.router.put(`${this.path}/:id`, auth, ValidationMiddleware(CreateUserDto, true), this.user.updateUser); //Update pseudo

    this.router.put(`${this.path}_updateRole/:id`, admin, ValidationMiddleware(CreateUserDto, true), this.user.updateUserRole); //Update role

    this.router.delete(`${this.path}/:id`, modo, this.user.deleteUser); // Delete user

    this.router.get(`${this.path}_decodage`, auth, this.user.decodageToken); // Décodage du token

    this.router.put(`${this.path}_resetPassword/:id`, ValidationMiddleware(ForgetPasswordDto, true), this.user.resetPassword); // Forget password

    this.router.post(`${this.path}_forgetPassword`, this.user.forgetPassword); // send email for password
  }
}
