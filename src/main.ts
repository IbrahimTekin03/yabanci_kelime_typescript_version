import express, { Application } from "express";
import hataMiddleware from "./middleware/hataMiddleware";
import wordRouter from "./routers/wordRouter";
import cors from "cors";
import userRouter from "./routers/userRouter";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(wordRouter);
app.use(userRouter);
app.use(hataMiddleware);

app.listen(3000, () => {
  console.log("3000 portu dinleniyor");
});