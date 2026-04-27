import { Router, type Request, type Response } from "express";
import { prisma } from "../prisma.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = Number(req.query.userId);

    if (!userId) {
      return res.status(400).json({ message: "userId is required." });
    }

    const events = await prisma.event.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    const formattedEvents = events.map((event) => ({
      ...event,
      date: event.date.toISOString().split("T")[0],
    }));

    res.json(formattedEvents);
  } catch (error) {
    res.status(500).json({ message: "Events could not be fetched" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { userId, title, description, date, time, type } = req.body;

    const event = await prisma.event.create({
      data: {
        userId: Number(userId),
        title,
        description,
        date: new Date(date),
        time,
        type,
      },
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({
      message: "Event could not be created",
    });
  }
});

router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { title, description, date, time, type } = req.body;

    const event = await prisma.event.update({
      where: { id },
      data: {
        title,
        description,
        date,
        time,
        type,
        updatedAt: new Date(),
      },
    });

    res.json(event);
  } catch (error) {
    res.status(500).json({
      message: "Event could not be updated.",
      error,
    });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    await prisma.event.delete({
      where: { id },
    });
    res.status(204).send();
  } catch {
    res.status(500).json({
      message: "Event could not be deleted.",
    });
  }
});
export default router;
