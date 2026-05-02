import { Router, type Request, type Response } from "express";
import { prisma } from "../prisma.js";
import { authMiddleware, type AuthRequest } from "../middleware/auth.js";

const router = Router();
router.use(authMiddleware);


const canEditNote = async (noteId: number, userId: number) => {
  return prisma.note.findFirst({
    where: {
      id: noteId,
      OR: [
        { userId },
        {
          shares: {
            some: {
              userId,
              permission: "edit",
            },
          },
        },
      ],
    },
  });
};

const isNoteOwner = async (noteId: number, userId: number) => {
  return prisma.note.findFirst({
    where: {
      id: noteId,
      userId,
    },
  });
};

router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const notes = await prisma.note.findMany({
      where: {
        OR: [
          {
            userId,
          },
          {
            shares: {
              some: {
                userId,
              },
            },
          },
        ],
      },
      include: {
        pdfs: true,
        shares: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const formattedNotes = notes.map((note) => {
      const shareInfo = note.shares.find((share) => share.userId === userId);

      return {
        ...note,
        isOwner: note.userId === userId,
        permission: note.userId === userId ? "owner" : shareInfo?.permission,
      };
    });

    res.json(formattedNotes);
  } catch (error) {
    console.error("FETCH NOTES ERROR:", error);
    res.status(500).json({ message: "Notes could not be fetched." });
  }
});

router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { title, content, starred, pdfs } = req.body;

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

    res.status(201).json({
      ...note,
      isOwner: true,
      permission: "owner"
    });
  } catch (error) {
    res.status(500).json({
      message: "Note could not be created.",
    });
  }
});

router.patch("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const noteId = Number(req.params.id);
    const userId = req.user!.userId;
    const { title, content, starred, pdfs } = req.body;

    const noteAccess = await canEditNote(noteId, userId);

    if (!noteAccess) {
      return res.status(403).json({
        message: "You do not have permission to edit this note.",
      });
    }

    const updateData: any = {
      title,
      content,
      starred,
    };

    if (pdfs) {
      updateData.pdfs = {
        deleteMany: {},
        create: pdfs.map((pdf: { name: string; url: string }) => ({
          name: pdf.name,
          url: pdf.url,
        })),
      };
    }

    const updatedNote = await prisma.note.update({
      where: {
        id: noteId,
      },
      data: updateData,
      include: {
        pdfs: true,
        shares: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json({
      ...updatedNote,
      isOwner: updatedNote.userId === userId,
      permission: updatedNote.userId === userId ? "owner" : "edit",
    });
  } catch {
    res.status(500).json({
      message: "Note could not be updated.",
    });
  }
});

router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const noteId = Number(req.params.id);
    const userId = req.user!.userId;

    const note = await isNoteOwner(noteId, userId);

    if (!note) {
      return res.status(403).json({
        message: "Only the note owner can delete this note.",
      });
    }

    await prisma.note.delete({
      where: {
        id: noteId,
      },
    });

    res.json({ message: "Note deleted successfully." });
  } catch {
    res.status(500).json({ message: "Note could not be deleted." });
  }
});

//share kısmının post patch ve delete kısmı

router.post("/:id/share", async (req: AuthRequest, res: Response) => {
  try {
    const noteId = Number(req.params.id);
    const ownerId = req.user!.userId;
    const { email, permission } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    if (!["read", "edit"].includes(permission)) {
      return res
        .status(400)
        .json({ message: "Permission must be read or edit." });
    }

    const note = await isNoteOwner(noteId, ownerId);

    if (!note) {
      return res.status(403).json({
        message: "Only the note owner can share this note.",
      });
    }

    const targetUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!targetUser) {
      return res.status(404).json({
        message: "User with this email was not found.",
      });
    }

    if (targetUser.id === ownerId) {
      return res.status(400).json({
        message: "You cannot share a note with yourself.",
      });
    }

    const share = await prisma.noteShare.upsert({
      where: {
        noteId_userId: {
          noteId,
          userId: targetUser.id,
        },
      },
      update: {
        permission,
      },
      create: {
        noteId,
        userId: targetUser.id,
        permission,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json(share);
  } catch (error) {
    console.error("SHARE NOTE ERROR:", error);
    res.status(500).json({ message: "Note could not be shared." });
  }
});

router.patch("/:id/share/:userId", async (req: AuthRequest, res: Response) => {
  try {
    const noteId = Number(req.params.id);
    const sharedUserId = Number(req.params.userId);
    const ownerId = req.user!.userId;
    const { permission } = req.body;

    if (!["read", "edit"].includes(permission)) {
      return res.status(400).json({ message: "Permission must be read or edit." });
    }

    const note = await isNoteOwner(noteId, ownerId);

    if (!note) {
      return res.status(403).json({
        message: "Only the note owner can update sharing permission.",
      });
    }

    const updatedShare = await prisma.noteShare.update({
      where: {
        noteId_userId: {
          noteId,
          userId: sharedUserId,
        },
      },
      data: {
        permission,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json(updatedShare);
  } catch {
    res.status(500).json({ message: "Sharing permission could not be updated." });
  }
});

router.delete("/:id/share/:userId", async (req: AuthRequest, res: Response) => {
  try {
    const noteId = Number(req.params.id);
    const sharedUserId = Number(req.params.userId);
    const ownerId = req.user!.userId;

    const note = await isNoteOwner(noteId, ownerId);

    if (!note) {
      return res.status(403).json({
        message: "Only the note owner can remove sharing.",
      });
    }

    await prisma.noteShare.delete({
      where: {
        noteId_userId: {
          noteId,
          userId: sharedUserId,
        },
      },
    });

    res.json({ message: "Sharing removed successfully." });
  } catch {
    res.status(500).json({ message: "Sharing could not be removed." });
  }
});
export default router;
