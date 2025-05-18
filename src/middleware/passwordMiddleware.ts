import bcrypt from "bcrypt";
import createError from "http-errors";
import User from "../models/userModel";
import { Request, Response, NextFunction } from "express";

interface AuthRequest extends Request {
  user?: any; // İstersen burada User tipini detaylandırabilirsin
}

const passwordMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email, sifre } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw createError(400, "Girilen email / şifre hatalı");
    }
    if (user.isActive === false) {
      throw createError(400, "Hesabınız aktif değil.");
    }
    if (user.email_active === false) {
      throw createError(400, "E-posta doğrulaması yapılmamış.");
    }

    const sifreKontrol = await bcrypt.compare(sifre, user.sifre);
    if (!sifreKontrol) {
      throw createError(400, "Girilen email / şifre hatalı");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export default passwordMiddleware;
