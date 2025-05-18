import { UserInstance } from "../../models/userModel";

declare global {
  namespace Express {
    interface Request {
      user?: UserInstance;
    }
  }
}

export {};