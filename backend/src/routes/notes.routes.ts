import { Router, type Request, type Response } from "express";
import { prisma } from "../prisma.js";
import { authMiddleware, type AuthRequest } from "../middleware/auth.js";


const router = Router();
router.use(authMiddleware);

router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const notes = await prisma.note.findMany({
      where: {
        userId,
      },
      include: {
        pdfs: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(notes);
  } catch (error) {
    console.error("FETCH NOTES ERROR:", error);
    res.status(500).json({ message: "Notes could not be fetched." });
  }
});


router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const {title, content, starred, pdfs } = req.body;

    const note = await prisma.note.create({
      data: {
        title,
        content,
        userId: Number(userId),
        starred: starred ?? false,
        pdfs: {
          create: (pdfs ?? []).map((pdf: any) => ({
            name: pdf.name,
            url: pdf.url,
          })),
        },
      },
    });

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({
      message: "Note could not be created.",
    });
  }
});

router.patch("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { title, content, starred } = req.body;

    const note = await prisma.note.update({
      where: { id },
      data: {
        title,
        content,
        starred,
        updatedAt: new Date(),
      },
      include: {
        pdfs: true,
      },
    });

    res.json(note);
  } catch (error) {
    res.status(500).json({
      message: "Note could not be updated.",
      error,
    });
  }
});

router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);

    await prisma.note.delete({
      where: { id },
    });

    res.status(204).send();
  } catch {
    res.status(500).json({ message: "Note could not be deleted." });
  }
});

export default router;
