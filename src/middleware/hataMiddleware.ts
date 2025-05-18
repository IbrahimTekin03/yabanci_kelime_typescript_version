import { Request, Response, NextFunction } from 'express';

const hataYakalayici = (err: any, req: Request, res: Response, next: NextFunction): void => {
  console.log(err);
  res.json({ hataKodu: err.statusCode, mesaj: err.message });
};

export default hataYakalayici;
