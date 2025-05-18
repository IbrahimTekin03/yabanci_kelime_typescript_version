import createError from "http-errors";
import { Request, Response, NextFunction } from "express";

const roleMiddleware = (requiredRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.getRoles) {
        return next(createError(401, "Kullanıcı bulunamadı"));
      }
      const roles = await req.user.getRoles();
      const userRoleNames = roles.map((role: any) => role.name);
      const hasRole = requiredRoles.some(role => userRoleNames.includes(role));
      if (!hasRole) {
        return next(createError(403, "Bu işlemi gerçekleştirmek için yetkiniz yok."));
      }
      next();
    } catch (error) {
      next(createError(500, "Rol kontrolü sırasında hata oluştu"));
    }
  };
};

export default roleMiddleware;