import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { AdminService } from '@/services/admin.service';

export class AdminController {
  public admin = Container.get(AdminService);

  public getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.admin.getDashboardStats();
      res.status(200).json({ data: stats, message: 'dashboard' });
    } catch (error) {
      next(error);
    }
  };
}
