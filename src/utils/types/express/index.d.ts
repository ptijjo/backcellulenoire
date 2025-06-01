import 'express';

declare module 'express' {
  export interface Request {
    user?: any; // ou mieux : user?: JwtPayload
    file?: any;
  }
}
