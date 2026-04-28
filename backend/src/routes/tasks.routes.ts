import { Router, type Response } from "express";
import { prisma } from "../prisma.js";
import { authMiddleware, type AuthRequest } from "../middleware/auth.js";

const router = Router();
router.use(authMiddleware);

const formatTask = (task: any) => ({
  ...task,
  dueDate: task.dueDate
    ? task.dueDate.toISOString().split("T")[0]
    : null,
});

router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    res.json(tasks.map(formatTask));
  } catch {
    res.status(500).json({ message: "Tasks could not be fetched." });
  }
});

router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { title, content, priority, dueDate, starred, completed } = req.body;

    const task = await prisma.task.create({
      data: {
        userId,
        title,
        content,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        starred: starred ?? false,
        completed: completed ?? false,
      },
    });

    res.status(201).json(formatTask(task));
  } catch {
    res.status(500).json({
      message: "Task could not be created.",
    });
  }
});

router.patch("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const userId = req.user!.userId;

    const { title, content, starred, completed, priority, dueDate } = req.body;

    const existing = await prisma.task.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({ message: "Task not found." });
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        title,
        content,
        starred,
        completed,
        priority,
        dueDate: dueDate ? new Date(dueDate) : existing.dueDate,
        updatedAt: new Date(),
      },
    });

    res.json(formatTask(task));
  } catch (error) {
    res.status(500).json({
      message: "Task could not be updated.",
      error,
    });
  }
});

router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const userId = req.user!.userId;

    const existing = await prisma.task.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({ message: "Task not found." });
    }

    await prisma.task.delete({
      where: { id },
    });

    res.status(204).send();
  } catch {
    res.status(500).json({
      message: "Task could not be deleted.",
    });
  }
});

export default router;