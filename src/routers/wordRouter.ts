import express, { Request, Response, NextFunction } from "express";
import db from "../db/dbConnection";
import authMiddleware from "../middleware/authMiddleware";
import { QueryTypes } from "sequelize";

const router = express.Router();

router.get("/random-word", authMiddleware, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const random = Math.random();
    let difficulty: number;

    if (random < 0.6) difficulty = 1;
    else if (random < 0.9) difficulty = 2;
    else difficulty = 3;

    const words: any[] = await db.query(
      `SELECT * FROM ingilizce_kelimeler WHERE zorluk = ? ORDER BY RAND() LIMIT 1`,
      { replacements: [difficulty], type: QueryTypes.SELECT }
    );

    const word = words[0];

    if (!word) {
      res.status(404).json({ mesaj: "Kelime bulunamadı" });
      return;
    }

    res.json({ id: word.id, english_word: word.ingilizce });
  } catch (error) {
    console.error("Hata oluştu:", error);
    next(error);
  }
});

router.post("/check-answer", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { wordId, answer } = req.body;

    if (!wordId) {
      res.status(400).json({ mesaj: "Kelime ID'si eksik" });
      return;
    }

    const words: any[] = await db.query(
      `SELECT * FROM ingilizce_kelimeler WHERE id = ?`,
      { replacements: [wordId], type: QueryTypes.SELECT }
    );
    const word = words[0];

    if (!word) {
      res.status(404).json({ mesaj: "Kelime bulunamadı" });
      return;
    }

    const isCorrect = word.türkçe.trim().toLowerCase() === answer.trim().toLowerCase();

    // @ts-ignore: req.user genişletmesini types/express/index.d.ts ile yaptığını varsayıyorum
    const userId = req.user?.id || req.user?._id;

    let existingRecords: any[] = await db.query(
      `SELECT * FROM kullanici_kelime_puanlari WHERE kullanici_id = ? AND kelime_id = ?`,
      { replacements: [userId, wordId], type: QueryTypes.SELECT }
    );
    const existingRecord = existingRecords[0];

    if (isCorrect) {
      if (existingRecord) {
        await db.query(
          `UPDATE kullanici_kelime_puanlari SET puan = puan + 5 WHERE id = ?`,
          { replacements: [existingRecord.id], type: QueryTypes.UPDATE }
        );
      } else {
        const kelimePuan = word.puan || 0;
        await db.query(
          `INSERT INTO kullanici_kelime_puanlari (kullanici_id, kelime_id, puan) VALUES (?, ?, ?)`,
          {
            replacements: [userId, wordId, kelimePuan + 5],
            type: QueryTypes.INSERT,
          }
        );
      }
    } else {
      if (existingRecord) {
        await db.query(
          `UPDATE kullanici_kelime_puanlari SET puan = puan - 5 WHERE id = ?`,
          { replacements: [existingRecord.id], type: QueryTypes.UPDATE }
        );
      } else {
        const kelimePuan = word.puan || 0;
        await db.query(
          `INSERT INTO kullanici_kelime_puanlari (kullanici_id, kelime_id, puan) VALUES (?, ?, ?)`,
          {
            replacements: [userId, wordId, kelimePuan - 5],
            type: QueryTypes.INSERT,
          }
        );
      }
    }

    const totalScores: any[] = await db.query(
      `SELECT SUM(puan) AS toplamPuan FROM kullanici_kelime_puanlari WHERE kullanici_id = ?`,
      { replacements: [userId], type: QueryTypes.SELECT }
    );
    const totalScore = totalScores[0];

    res.json({
      dogru: isCorrect,
      yeniPuan: totalScore?.toplamPuan ?? 0,
    });
  } catch (error) {
    console.error("Hata oluştu:", error);
    next(error);
  }
});

export default router;