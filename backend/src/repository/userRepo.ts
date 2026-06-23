import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema/user.schema.js";
import bcrypt from "bcrypt";

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: "admin" | "user";
}

export interface UserDocument {
  id: number;
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
  isVerified: boolean;
  refreshToken: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const findByEmail = async (
  email: string,
): Promise<UserDocument | undefined> => {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user;
};

export const findById = async (
  id: string,
): Promise<UserDocument | undefined> => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, parseInt(id)));
  return user;
};

export const createUser = async (
  data: CreateUserData,
): Promise<UserDocument> => {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const [newUser] = await db
    .insert(users)
    .values({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role || "user",
    })
    .returning();

  return newUser;
};

export const updateUser = async (
  id: string,
  data: Partial<Pick<UserDocument, "isVerified" | "refreshToken" | "password">>,
): Promise<UserDocument | undefined> => {
  const updateData: any = { ...data, updatedAt: new Date() };

  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  const [updated] = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, parseInt(id)))
    .returning();

  return updated;
};
