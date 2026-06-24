import { db } from "../db/index.js";
import { eq, and, desc, sql } from "drizzle-orm";
import { notes } from "../db/schema/note.schema.js";
import { CreateNoteInput, UpdateNoteInput } from "../db/schema/note.schema.js";

export interface NoteFilter {
  limit?: number;
  offset?: number;
}

export const findByUserId = async (
  userId: number,
  filters: NoteFilter = {},
) => {
  const limit = filters.limit || 20;
  const offset = filters.offset || 0;

  const data = await db
    .select()
    .from(notes)
    .where(eq(notes.userId, userId))
    .orderBy(desc(notes.createdAt))
    .limit(limit)
    .offset(offset);

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(notes)
    .where(eq(notes.userId, userId));

  return {
    data,
    total: Number(countResult.count),
    limit,
    offset,
  };
};

export const findByIdAndUserId = async (id: number, userId: number) => {
  const [note] = await db
    .select()
    .from(notes)
    .where(and(eq(notes.id, id), eq(notes.userId, userId)));

  return note;
};

export const createNotes = async (userId: number, data: CreateNoteInput) => {
  const [newNote] = await db
    .insert(notes)
    .values({ userId, title: data.title, content: data.content })
    .returning();

  return newNote;
};

export const update = async (
  id: number,
  userId: number,
  data: UpdateNoteInput,
) => {
  const [updateNote] = await db
    .update(notes)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(notes.id, id), eq(notes.userId, userId)))
    .returning();

  return updateNote;
};

export const remove = async (id: number, userId: number) => {
  await db.delete(notes).where(and(eq(notes.id, id), eq(notes.userId, userId)));
};
