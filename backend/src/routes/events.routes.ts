import { Router, type Response } from "express";
import { prisma } from "../prisma.js";
import { authMiddleware, type AuthRequest } from "../middleware/auth.js";

const router = Router();
router.use(authMiddleware);

const formatEvent = (event: any) => ({
  ...event,
  date: event.date.toISOString().split("T")[0],
});

router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const events = await prisma.event.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    res.json(events.map(formatEvent));
  } catch {
    res.status(500).json({ message: "Events could not be fetched" });
  }
});

router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { title, description, date, time, type } = req.body;

    const event = await prisma.event.create({
      data: {
        userId,
        title,
        description,
        date: new Date(date),
        time,
        type,
      },
    });

    res.status(201).json(formatEvent(event));
  } catch {
    res.status(500).json({ message: "Event could not be created" });
  }
});

router.patch("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const userId = req.user!.userId;
    const { title, description, date, time, type } = req.body;

    const existing = await prisma.event.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({ message: "Event not found." });
    }

    const event = await prisma.event.update({
      where: { id },
      data: {
        title,
        description,
        date: date ? new Date(date) : existing.date,
        time,
        type,
        updatedAt: new Date(),
      },
    });

    res.json(formatEvent(event));
  } catch (error) {
    res.status(500).json({
      message: "Event could not be updated.",
      error,
    });
  }
});

router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const userId = req.user!.userId;

        const existing = await prisma.event.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({ message: "Event not found." });
    }

    await prisma.event.delete({ where: { id } });

    res.status(204).send();
  } catch {
    res.status(500).json({ message: "Event could not be deleted." });
  }
});

export default router;
