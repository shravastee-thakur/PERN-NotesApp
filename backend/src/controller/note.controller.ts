import { Request, Response, NextFunction } from "express";
import * as noteService from "../services/noteService.js";
import {
  createNoteRequestSchema,
  updateNoteRequestSchema,
} from "../db/schema/note.schema.js";

export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = parseInt(req.user!.id, 10);
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : undefined;
    const offset = req.query.offset
      ? parseInt(req.query.offset as string, 10)
      : undefined;

    const result = await noteService.getAllNotes(userId, limit, offset);

    res.json({
      success: true,
      message: "Notes retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = parseInt(req.user!.id, 10);
    const noteId = parseInt(req.params.id, 10);

    if (isNaN(noteId)) {
      throw new Error("Invalid note ID format");
    }

    const note = await noteService.getNoteById(noteId, userId);

    res.json({
      success: true,
      message: "Note retrieved successfully",
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = parseInt(req.user!.id, 10);
    const validatedData = createNoteRequestSchema.parse(req.body);

    const newNote = await noteService.createNote(userId, validatedData);

    res.status(201).json({
      success: true,
      message: "Note created successfully",
      data: newNote,
    });
  } catch (error) {
    next(error);
  }
};

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = parseInt(req.user!.id, 10);
    const noteId = parseInt(req.params.id, 10);
    const validatedData = updateNoteRequestSchema.parse(req.body);

    if (isNaN(noteId)) {
      throw new Error("Invalid note ID format");
    }

    const updatedNote = await noteService.updateNote(
      noteId,
      userId,
      validatedData,
    );

    res.json({
      success: true,
      message: "Note updated successfully",
      data: updatedNote,
    });
  } catch (error) {
    next(error);
  }
};

export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = parseInt(req.user!.id, 10);
    const noteId = parseInt(req.params.id, 10);

    if (isNaN(noteId)) {
      throw new Error("Invalid note ID format");
    }

    await noteService.deleteNote(noteId, userId);

    res.json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
