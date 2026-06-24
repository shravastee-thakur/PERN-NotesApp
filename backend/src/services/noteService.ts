import * as notesRepo from "../repository/notesRepo.js";
import { ApiError } from "../utils/apiError.js";
import { CreateNoteInput, UpdateNoteInput } from "../db/schema/note.schema.js";

export const getAllNotes = async (
  userId: number,
  limit?: number,
  offset?: number,
) => {
  return await notesRepo.findByUserId(userId, { limit, offset });
};

export const getNoteById = async (id: number, userId: number) => {
  const note = await notesRepo.findByIdAndUserId(id, userId);
  if (!note) {
    throw new ApiError(404, "Note not found");
  }
  return note;
};

export const createNote = async (userId: number, data: CreateNoteInput) => {
  return await notesRepo.createNotes(userId, data);
};

export const updateNote = async (
  id: number,
  userId: number,
  data: UpdateNoteInput,
) => {
  if (Object.keys(data).length === 0) {
    throw new ApiError(400, "No update data provided");
  }

  const updatedNote = await notesRepo.update(id, userId, data);
  if (!updatedNote) {
    throw new ApiError(404, "Note not found");
  }

  return updatedNote;
};

export const deleteNote = async (id: number, userId: number) => {
  const existingNote = await notesRepo.findByIdAndUserId(id, userId);
  if (!existingNote) {
    throw new ApiError(404, "Note not found");
  }

  await notesRepo.remove(id, userId);
};
