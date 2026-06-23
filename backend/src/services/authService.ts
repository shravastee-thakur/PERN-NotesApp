import * as userRepo from "../repository/userRepo.js";
import { ApiError } from "../utils/apiError.js";
import { CreateUserData, UserDocument } from "../repository/userRepo.js";
import crypto from "crypto";
import {
  generateAccessToken,
  generateRefreshToken,
  TokenPayload,
  verifyRefreshToken,
} from "../utils/jwt.js";
import bcrypt from "bcrypt";
import { RegisterInput, LoginInput } from "../db/schema/user.schema.js";

export interface UserDto {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const mapToDTO = (user: UserDocument): UserDto => {
  return {
    id: user.id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const register = async (data: RegisterInput): Promise<UserDto> => {
  const { name, email, password, role } = data;

  const existing = await userRepo.findByEmail(email);
  if (existing) {
    throw new ApiError(409, "User already exists");
  }

  const newUser = await userRepo.createUser({ name, email, password, role });
  return mapToDTO(newUser);
};

export const loginVerifyCredentials = async (
  data: LoginInput,
): Promise<UserDto> => {
  const { email, password } = data;
  const user = await userRepo.findByEmail(email);
  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new ApiError(401, "Invalid credentials");
  }

  return mapToDTO(user);
};

export const createTokensAndSave = async (user: UserDto) => {
  const tokenPayload: TokenPayload = {
    id: user.id,
    role: user.role,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  const hashedRefreshToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  await userRepo.updateUser(user.id, {
    refreshToken: hashedRefreshToken,
  });

  return { accessToken, refreshToken };
};

export const rotateRefreshToken = async (oldToken: string) => {
  let decoded: TokenPayload;
  try {
    decoded = verifyRefreshToken(oldToken);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await userRepo.findById(decoded.id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const hashedRefreshToken = crypto
    .createHash("sha256")
    .update(oldToken)
    .digest("hex");

  const isMatch = user.refreshToken === hashedRefreshToken;

  if (!isMatch) {
    throw new ApiError(401, "Refresh token mismatch");
  }

  const safeUser = mapToDTO(user);
  const { accessToken, refreshToken } = await createTokensAndSave(safeUser);

  return { accessToken, refreshToken, user: safeUser };
};

export const logout = async (userId: string) => {
  if (!userId) return;
  await userRepo.updateUser(userId, { refreshToken: "" });
};
