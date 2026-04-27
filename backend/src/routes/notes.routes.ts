import { Router, type Request, type Response } from "express";
import { prisma } from "../prisma.js";

const router = Router();

/**
 * @swagger
 * /api/notes:
 *   get:
 *     summary: Get notes by userId
 *     tags: [Notes]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Notes fetched successfully
 *       400:
 *         description: userId is required
 *       500:
 *         description: Notes could not be fetched
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = Number(req.query.userId);

    if (!userId) {
      return res.status(400).json({ message: "userId is required." });
    }

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

/**
 * @swagger
 * /api/notes:
 *   post:
 *     summary: Create a new note
 *     tags: [Notes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - userId
 *             properties:
 *               title:
 *                 type: string
 *                 example: My first note
 *               content:
 *                 type: string
 *                 example: This is note content.
 *               userId:
 *                 type: integer
 *                 example: 1
 *               starred:
 *                 type: boolean
 *                 example: false
 *               pdfs:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: document.pdf
 *                     url:
 *                       type: string
 *                       example: /uploads/document.pdf
 *     responses:
 *       201:
 *         description: Note created successfully
 *       500:
 *         description: Note could not be created
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    console.log("BODY:", req.body);

    const { title, content, userId, starred, pdfs } = req.body;

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
    console.error("CREATE NOTE ERROR:", error);

    res.status(500).json({
      message: "Note could not be created.",
    });
  }
});

router.patch("/:id", async (req, res) => {
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

router.delete("/:id", async (req: Request, res: Response) => {
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
