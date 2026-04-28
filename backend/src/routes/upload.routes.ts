import { Router } from "express";
import multer from "multer";

const router = Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post("/", upload.single("file"), (req, res) => {
  const file = req.file;

  res.json({
    name: file?.originalname,
    url: `/uploads/${file?.filename}`,
  });
});

export default router;