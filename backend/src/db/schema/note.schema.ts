import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./user.schema.js";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Validates the shape of the data going into the database
export const insertNoteSchema = createInsertSchema(notes, {
  title: (schema) =>
    schema
      .min(1, "Title is required")
      .max(100, "Title must be 100 characters or less"),

  content: (schema) => schema.min(1, "Note content cannot be empty"),
});

// The API Request Schema (Validates what the user sends in req.body)
export const createNoteRequestSchema = insertNoteSchema.pick({
  title: true,
  content: true,
});

export type CreateNoteInput = z.infer<typeof createNoteRequestSchema>;
