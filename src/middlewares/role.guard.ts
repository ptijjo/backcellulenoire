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

export const RoleGuard = (requiredRoles = []) => {
  return (req, res, next) => {
    if (!requiredRoles.length) return next();

    const user = req.user;
    if (!user) return next(new HttpException(409, 'Utilisateur non authentifié'));

    try {
      const userRoles = validateUserRoles(user.role);

      const hasRole = requiredRoles.some(role => {
        console.log('Role autorisé :', role);
        return userRoles.includes(role);
      });

      if (!hasRole) return next(new HttpException(409, 'Accès interdit'));
      next();
    } catch (error) {
      return next(new HttpException(400, error.message));
    }
  };
};
