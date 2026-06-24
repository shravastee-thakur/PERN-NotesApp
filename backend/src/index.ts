import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/error.middleware.js";
import { authRouter } from "./routes/authRoutes.js";
import { noteRouter } from "./routes/noteRoutes.js";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);
app.use(cookieParser());

app.use('/api/auth', authRouter);
// http://localhost:5000/api/auth/register
app.use('/api/notes', noteRouter);
// http://localhost:5000/api/notes/

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Listening on port: http://localhost:${PORT}`);
});
