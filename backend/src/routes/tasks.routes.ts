import { Router, type Request, type Response } from "express";
import { prisma } from "../prisma.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = Number(req.query.userId);

    if (!userId) {
      return res.status(400).json({ message: "userId is required." });
    }

    const tasks = await prisma.task.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Tasks could not be fetched." });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { title, content, userId, priority, dueDate, starred } = req.body;

    const task = await prisma.task.create({
      data: {
        title,
        content,
        userId: Number(userId),
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        starred: starred ?? false,
      },
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({
      message: "Note could not be created.",
    });
  }
});

router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { title, content, starred, priority, dueDate } = req.body;

    const task = await prisma.task.update({
      where: { id },
      data: {
        title,
        content,
        starred,
        dueDate,
        priority,
        updatedAt: new Date(),
      },
    });
    res.json(task);
  } catch (error) {
    res.status(500).json({
      message: "Task could not be updated.",
      error,
    });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

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
