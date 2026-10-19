const express = require("express");
const multer = require("multer");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const { authenticate, requireRole } = require("../Middleware/authenticate");
const {
  getAds,
  getPublicAds,
  createAds,
  updateAd,
  reorderAds,
  deleteAd,
} = require("../Controller/advController");

const router = express.Router();

const MAX_FILES = 10;
const MAX_SIZE_MB = 5;
const UPLOAD_DIR = path.join(process.cwd(), "uploads", "ads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, cb) =>
      cb(null, `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${path.extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024, files: MAX_FILES },
  fileFilter: (req, file, cb) =>
    file.mimetype.startsWith("image/")
      ? cb(null, true)
      : cb(new Error("Only image files are allowed")),
});

// Turns multer errors into the { message } JSON the frontend reads
const uploadImages = (req, res, next) =>
  upload.array("images", MAX_FILES)(req, res, (err) => {
    if (!err) return next();
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? `Each image must be under ${MAX_SIZE_MB} MB`
        : err.code === "LIMIT_FILE_COUNT" || err.code === "LIMIT_UNEXPECTED_FILE"
        ? `You can upload up to ${MAX_FILES} images at a time`
        : err.message;
    res.status(400).json({ message });
  });

// Public (client form pages)
router.get("/public", getPublicAds);

// Admin + host
router.use(authenticate, requireRole("admin", "host"));

router.get("/", getAds);
router.post("/", uploadImages, createAds);
router.patch("/reorder", reorderAds); // must stay above "/:id"
router.patch("/:id", updateAd);
router.delete("/:id", deleteAd);

module.exports = router;