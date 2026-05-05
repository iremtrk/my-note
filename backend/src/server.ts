import express, { type Request, type Response } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../swagger-output.json" with {type: "json"};

import notesRouter from "./routes/notes.routes.js";
import tasksRouter from "./routes/tasks.routes.js";
import eventsRouter from "./routes/events.routes.js";

import authRouter from "./routes/auth.routes.js";

import uploadRouter from "./routes/upload.routes.js";

const app = express();
const PORT = 5000;

app.use(
  cors({
    origin: [
      "http://localhost:5173", // local geliştirme
      "https://remarkable-sprinkles-0f3c6d.netlify.app", // canlı frontend
    ],
    credentials: true,
  })
);
app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.send("My Note backend is running");
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api/notes", notesRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/events", eventsRouter);

app.use("/api/auth", authRouter);

app.use("/uploads", express.static("uploads"));
app.use("/api/upload", uploadRouter);


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});