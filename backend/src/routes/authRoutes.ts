import { Router } from "express";
import * as authController from "../controller/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

export const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.post("/refresh", authController.refreshToken);
authRouter.post("/logout", authenticate, authController.logout);
