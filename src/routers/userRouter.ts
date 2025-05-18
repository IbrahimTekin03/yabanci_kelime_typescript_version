import express, { Request, Response, NextFunction } from "express";
import User, { UserInstance } from "../models/userModel";
import Role from "../models/roleModel";
import createError from "http-errors";
import bcrypt from "bcrypt";
import authMiddleware from "../middleware/authMiddleware";
import passwordMiddleware from "../middleware/passwordMiddleware";
import roleMiddleware from "../middleware/roleMiddleware";
import db from "../db/dbConnection";
import { QueryTypes } from "sequelize";

const router = express.Router();

router.get(
  "/getAllUsers",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tumUserlar = await User.findAll();
      const usersWithoutPassword = tumUserlar.map((user: UserInstance) => {
        const userObject = user.toJSON() as any;
        delete userObject.sifre;
        return userObject;
      });
      res.json(usersWithoutPassword);
      return;
    } catch (error) {
      next(createError(400, error instanceof Error ? error.message : String(error)));
    }
  }
);

router.get(
  "/getUser/:id",
  authMiddleware,
  roleMiddleware(["admin", "user"]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await User.findByPk(req.params.id) as UserInstance | null;
      if (!user) {
        throw createError(404, "Kullanıcı bulunamadı");
      }
      const userObject = user.toJSON() as any;
      delete userObject.sifre;
      res.json(userObject);
    } catch (error) {
      next(createError(400, error instanceof Error ? error.message : String(error)));
    }
  }
);

router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sonuc = await User.destroy({ where: { id: req.params.id } });
    if (sonuc) {
      res.json({
        mesaj: "id'si : " + req.params.id + " olan kullanıcı silindi",
      });
    } else {
      throw createError(404, "silinecek kullanıcı bulunamadı");
    }
  } catch (error) {
    next(createError(400, error instanceof Error ? error.message : String(error)));
  }
});

router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin", "user"]),
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.body.hasOwnProperty("sifre")) {
      req.body.sifre = await bcrypt.hash(req.body.sifre, 10);
    }

    const { error } = User.joiValidationForUpdate(req.body);
    if (error) {
      return next(createError(400, error));
    } else {
      try {
        const sonuc = await User.update(req.body, {
          where: { id: req.params.id },
          returning: true,
        });
        if (sonuc && (sonuc as any)[1]) {
          const updatedUser = (sonuc as any)[1].toJSON() as any;
          delete updatedUser.sifre;
          res.json(updatedUser);
        } else {
          res
            .status(404)
            .json({ mesaj: "güncellenecek kullanıcı bulunamadı" });
        }
      } catch (error) {
        next(createError(400, error instanceof Error ? error.message : String(error)));
      }
    }
  }
);

router.post("/register", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existingUserName = await User.findOne({
      where: { userName: req.body.userName },
    });
    if (existingUserName) {
      throw createError(400, "Bu kullanıcı adı zaten kullanılıyor.");
    }

    const existingEmail = await User.findOne({
      where: { email: req.body.email },
    });
    if (existingEmail) {
      throw createError(400, "Bu email zaten kullanılıyor.");
    }

    const hashedPassword = await bcrypt.hash(req.body.sifre, 10);
    const eklenecekUser = await User.create({
      isim: req.body.isim,
      userName: req.body.userName,
      email: req.body.email,
      sifre: hashedPassword,
      isActive: true,
      email_active: true,
    }) as UserInstance;

    const userRole = await Role.findOne({ where: { name: "user" } });
    if (!userRole) {
      throw createError(400, "User rolü bulunamadı.");
    }
    await eklenecekUser.addRole(userRole);

    const token = await eklenecekUser.generateToken();

    const userObject = eklenecekUser.toJSON() as any;
    delete userObject.sifre;
    delete userObject.createdAt;
    delete userObject.updatedAt;

    res.status(201).json({ user: userObject, token });
  } catch (error) {
    next(error);
    console.log("user kaydederken hata: " + error);
  }
});

router.post("/login", passwordMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = await req.user?.generateToken();
    const userObject = req.user?.toJSON() as any;
    if (userObject) {
      delete userObject.sifre;
      delete userObject.createdAt;
      delete userObject.updatedAt;
    }

    const roles = await req.user?.getRoles();
    const roleNames = roles ? roles.map((role: any) => role.name) : [];

    res.status(200).json({
      user: { userName: userObject?.userName, role: roleNames },
      token,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/addAdmin", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminRole = await Role.findOne({ where: { name: "admin" } });
    if (!adminRole) {
      throw createError(400, "Admin rolü bulunamadı.");
    }

    const hashedPassword = await bcrypt.hash(req.body.sifre, 10);
    const adminUser = await User.create({
      isim: req.body.isim,
      userName: req.body.userName,
      email: req.body.email,
      sifre: hashedPassword,
      isActive: true,
      email_active: true,
    }) as UserInstance;

    await adminUser.addRole(adminRole);

    const adminUserWithRoles = await User.findByPk(adminUser.id, {
      include: { model: Role, through: { attributes: [] } },
    }) as UserInstance | null;

    const token = await adminUserWithRoles?.generateToken();
    console.log("Admin için oluşturulan token:", token);

    res
      .status(201)
      .json({ mesaj: "Admin kullanıcı başarıyla eklendi.", token });
  } catch (error) {
    next(error);
  }
});

router.post("/add-word", authMiddleware, async function (req, res, next) {
  try {
    const { englishWord, turkishWord, puan, zorluk } = req.body;

    if (!englishWord || !turkishWord || !puan || !zorluk) {
      res.status(400).json({ mesaj: "Tüm alanlar doldurulmalıdır" });
      return;
    }

    await db.query(
      `INSERT INTO ingilizce_kelimeler (ingilizce, türkçe, puan, zorluk) VALUES (?, ?, ?, ?)`,
      {
        replacements: [englishWord, turkishWord, puan, zorluk],
        type: QueryTypes.INSERT,
      }
    );

    res.status(201).json({ mesaj: "Kelime başarıyla eklendi" });
  } catch (error) {
    console.error("Hata oluştu:", error);
    next(error);
  }
});

router.get("/verify-admin", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roles = await req.user?.getRoles();
    const isAdmin = roles ? roles.some((role: any) => role.name === "admin") : false;

    if (!isAdmin) {
      res.status(403).json({ mesaj: "Yetkisiz erişim" });
      return;
    }

    res.status(200).json({ mesaj: "Admin doğrulandı" });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // JWT ile logout işlemi için backend'de işlem yapmaya gerek yok
    res.status(200).json({ mesaj: "Başarıyla çıkış yapıldı" });
  } catch (error) {
    next(error);
  }
});

export default router;