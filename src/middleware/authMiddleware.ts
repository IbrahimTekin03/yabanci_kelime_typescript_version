import jwt from "jsonwebtoken";
import User from "../models/userModel";
import { Request, Response, NextFunction, RequestHandler } from "express";

const authMiddleware: RequestHandler = (req, res, next) => {
  (async () => {
    try {
      const authHeader = req.header("Authorization");
      if (!authHeader) {
        return res.status(401).json({ mesaj: "Authorization başlığı eksik" });
      }
      const token = authHeader.replace("Bearer ", "");
      const decoded = jwt.verify(token, "secretkey") as any;
      const userId = decoded._id || decoded.id;
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(401).json({ mesaj: "Kullanıcı bulunamadı" });
      }
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ mesaj: "Yetkilendirme hatası" });
    }
  })();
};

export default authMiddleware;