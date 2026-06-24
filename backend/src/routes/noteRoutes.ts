import { Router } from "express";
import * as noteController from "../controller/note.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

export const noteRouter = Router();

noteRouter.get("/", authenticate, noteController.getAll);
noteRouter.get("/:id", authenticate, noteController.getById);
noteRouter.post("/", authenticate, noteController.create);
noteRouter.put("/:id", authenticate, noteController.update);
noteRouter.delete("/:id", authenticate, noteController.remove);
