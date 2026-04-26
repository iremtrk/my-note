import express, { type Request, type Response } from "express";
import cors from "cors";
import notesRouter from "./routes/notes.routes.js";
import authRouter from "./routes/auth.routes.js";

import uploadRouter from "./routes/upload.routes.js";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.send("My Note backend is running");
});

app.use("/api/notes", notesRouter);
app.use("/api/auth", authRouter);

app.use("/uploads", express.static("uploads"));
app.use("/api/upload", uploadRouter);


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});