/* eslint-disable prettier/prettier */
import { NextFunction, Request, Response } from 'express';

export class HomeController {
  public Welcome = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(200).send('Hello');
    } catch (error) {
      next(error);
    }
  };
}
