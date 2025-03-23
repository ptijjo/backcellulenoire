import { ROLE } from '@prisma/client';

export interface User {
  id?: string;
  email: string;
  password?: string;
  pseudo: string;
  avatar?: string;
  download?: number;
  role?: ROLE;
  createdAt: Date;
  idInvitation: string;
}
