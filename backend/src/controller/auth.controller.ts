import { Request, Response, NextFunction } from "express";
import * as userService from "../services/authService.js";
import {
  RegisterInput,
  LoginInput,
  registerUserSchema,
  loginUserSchema,
} from "../db/schema/user.schema.js";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validatedData = registerUserSchema.parse(req.body);
    const user = await userService.register(validatedData);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validatedData = loginUserSchema.parse(req.body);
    const user = await userService.loginVerifyCredentials(validatedData);
    const tokens = await userService.createTokensAndSave(user);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user,
        ...tokens,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new Error("Refresh token required");
    }

    const result = await userService.rotateRefreshToken(refreshToken);

    res.json({
      success: true,
      message: "Token refreshed successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (userId) {
      await userService.logout(userId);
    }

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};
