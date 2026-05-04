import { Router, type Response} from "express";
import multer from "multer";
import { authMiddleware, type AuthRequest } from "../middleware/auth.js";

const router = Router();
router.use(authMiddleware)

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post("/", upload.single("file"), (req:AuthRequest, res:Response) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "No file uploaded." });
  }

  res.json({
    name: file?.originalname,
    url: `/uploads/${file?.filename}`,
  });
});

export default router;