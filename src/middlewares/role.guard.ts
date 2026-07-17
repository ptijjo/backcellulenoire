import { HttpException } from '@/exceptions/httpException';
import { ROLE } from '@prisma/client';

const validateUserRoles = userRoles => {
  if (!Array.isArray(userRoles)) {
    userRoles = [userRoles];
  }
  return userRoles.map(role => {
    if (!ROLE[role]) throw new Error(`Rôle invalide: ${role}`);
    return ROLE[role];
  });
};

export const RoleGuard = (requiredRoles: Array<'new' | 'user' | 'modo' | 'admin'> = []) => {
  return (req, res, next) => {
    // Tableau vide = tout utilisateur authentifié (CookieGuard déjà passé).
    if (!requiredRoles.length) return next();

    const user = req.user;
    if (!user) return next(new HttpException(409, 'Utilisateur non authentifié'));

    try {
      const userRoles = validateUserRoles(user.role);

      const hasRole = requiredRoles.some(role => userRoles.includes(role));

      if (!hasRole) return next(new HttpException(409, 'Accès interdit'));
      next();
    } catch (error) {
      return next(new HttpException(400, error.message));
    }
  };
};
