import { Router, type Response } from "express";
import { prisma } from "../prisma.js";
import { authMiddleware, type AuthRequest } from "../middleware/auth.js";
import bcrypt from "bcryptjs";

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

const canViewNote = async (noteId: number, userId: number) => {
  return prisma.note.findFirst({
    where: {
      id: noteId,
      OR: [
        { userId },
        {
          shares: {
            some: {
              userId,
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
          { userId },
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
        noteLocks: {
          where: {
            userId,
          },
        },
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
      const isOwner = note.userId === userId;
      const shareInfo = note.shares.find((share) => share.userId === userId);
      const filteredShares = isOwner ? note.shares : shareInfo ? [shareInfo] : [];

      const isLockedForMe = note.noteLocks.length > 0;

      const { noteLocks, ...safeNote } = note;

      return {
        ...safeNote,
        content: isLockedForMe ? "" : note.content,
        pdfs: isLockedForMe ? [] : note.pdfs,
        shares: filteredShares,
        isLocked: isLockedForMe,
        isOwner,
        permission: isOwner ? "owner" : shareInfo?.permission,
      };
    });

    res.json(formattedNotes);
  } catch (error: any) {
  console.error("FETCH NOTES ERROR:", error);

  res.status(500).json({
    message: "Notes could not be fetched.",
    error: error.message,
    code: error.code,
    meta: error.meta,
  });
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
      include: {
        pdfs: true,
        shares: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      ...note,
      isLocked: false,
      isOwner: true,
      permission: "owner",
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
        noteLocks: {
          where: {
            userId,
          },
        },
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

    const isOwner = updatedNote.userId === userId;
    const shareInfo = updatedNote.shares.find((share) => share.userId === userId);
    const filteredShares = isOwner ? updatedNote.shares : shareInfo ? [shareInfo] : [];

    const isLockedForMe = updatedNote.noteLocks.length > 0;

    const { noteLocks, ...safeNote } = updatedNote;

    res.json({
      ...safeNote,
      content: isLockedForMe ? "" : updatedNote.content,
      pdfs: isLockedForMe ? [] : updatedNote.pdfs,
      shares: filteredShares,
      isLocked: isLockedForMe,
      isOwner,
      permission: isOwner ? "owner" : "edit",
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


router.post("/:id/share", async (req: AuthRequest, res: Response) => {
  try {
    const noteId = Number(req.params.id);
    const ownerId = req.user!.userId;
    const { email, permission } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    if (!["read", "edit"].includes(permission)) {
      return res.status(400).json({
        message: "Permission must be read or edit.",
      });
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

    const existingShare = await prisma.noteShare.findUnique({
      where: {
        noteId_userId: {
          noteId,
          userId: targetUser.id,
        },
      },
    });

    if (existingShare) {
      return res.status(400).json({
        message: "This note is already shared with this user.",
      });
    }

    const share = await prisma.noteShare.create({
      data: {
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
      return res.status(400).json({
        message: "Permission must be read or edit.",
      });
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
    res.status(500).json({
      message: "Sharing permission could not be updated.",
    });
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
    res.status(500).json({
      message: "Sharing could not be removed.",
    });
  }
});

router.post("/:id/lock", async (req: AuthRequest, res: Response) => {
  try {
    const noteId = Number(req.params.id);
    const userId = req.user!.userId;
    const { pin } = req.body;

    if (!pin || pin.length < 4) {
      return res.status(400).json({
        message: "PIN must be at least 4 characters long.",
      });
    }

    const noteAccess = await canViewNote(noteId, userId);

    if (!noteAccess) {
      return res.status(403).json({
        message: "You do not have access to this note.",
      });
    }

    const pinHash = await bcrypt.hash(pin, 10);

    await prisma.noteLock.upsert({
      where: {
        noteId_userId: {
          noteId,
          userId,
        },
      },
      update: {
        pinHash,
      },
      create: {
        noteId,
        userId,
        pinHash,
      },
    });

    res.json({
      message: "Note locked successfully.",
      isLocked: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Could not lock the note.",
    });
  }
});

router.post("/:id/remove-lock", async (req: AuthRequest, res: Response) => {
  try {
    const noteId = Number(req.params.id);
    const userId = req.user!.userId;
    const { pin } = req.body;

    const lock = await prisma.noteLock.findUnique({
      where: {
        noteId_userId: {
          noteId,
          userId,
        },
      },
    });

    if (!lock) {
      return res.status(400).json({
        message: "This note is not locked for you.",
      });
    }

    const isMatch = await bcrypt.compare(pin, lock.pinHash);

    if (!isMatch) {
      return res.status(401).json({
        message: "Incorrect PIN.",
      });
    }

    await prisma.noteLock.delete({
      where: {
        noteId_userId: {
          noteId,
          userId,
        },
      },
    });

    res.json({
      message: "Lock removed successfully.",
      isLocked: false,
    });
  } catch (error) {
    res.status(500).json({
      message: "Could not remove lock.",
    });
  }
});

router.post("/:id/verify-pin", async (req: AuthRequest, res: Response) => {
  try {
    const noteId = Number(req.params.id);
    const userId = req.user!.userId;
    const { pin } = req.body;

    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        OR: [
          { userId },
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
        noteLocks: {
          where: {
            userId,
          },
        },
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

    if (!note) {
      return res.status(403).json({
        message: "You do not have access to this note.",
      });
    }

    const lock = note.noteLocks[0];

    if (!lock) {
      return res.status(400).json({
        message: "This note is not locked for you.",
      });
    }

    const isMatch = await bcrypt.compare(pin, lock.pinHash);

    if (!isMatch) {
      return res.status(401).json({
        message: "Incorrect PIN.",
      });
    }

    const isOwner = note.userId === userId;
    const shareInfo = note.shares.find((share) => share.userId === userId);
    const filteredShares = isOwner ? note.shares : shareInfo ? [shareInfo] : [];

    const { noteLocks, ...safeNote } = note;

    res.json({
      ...safeNote,
      shares: filteredShares,
      isLocked: false,
      isOwner,
      permission: isOwner ? "owner" : shareInfo?.permission,
    });
  } catch (error) {
    res.status(500).json({
      message: "Could not verify PIN.",
    });
  }
});

router.post("/:id/reset-pin", async (req: AuthRequest, res: Response) => {
  try {
    const noteId = Number(req.params.id);
    const userId = req.user!.userId;
    const { password, newPin } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required." });
    }

    if (!newPin || newPin.length < 4) {
      return res.status(400).json({
        message: "New PIN must be at least 4 characters long.",
      });
    }

    const noteAccess = await canViewNote(noteId, userId);

    if (!noteAccess) {
      return res.status(403).json({
        message: "You do not have access to this note.",
      });
    }

    const lock = await prisma.noteLock.findUnique({
      where: {
        noteId_userId: {
          noteId,
          userId,
        },
      },
    });

    if (!lock) {
      return res.status(400).json({
        message: "This note is not locked for you.",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Incorrect password.",
      });
    }

    const newPinHash = await bcrypt.hash(newPin, 10);

    await prisma.noteLock.update({
      where: {
        noteId_userId: {
          noteId,
          userId,
        },
      },
      data: {
        pinHash: newPinHash,
      },
    });

    res.json({
      message: "PIN reset successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Could not reset PIN.",
    });
  }
});

export default router;