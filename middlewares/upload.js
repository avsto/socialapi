// middlewares/upload.js
const multer = require("multer");
const path = require("path");
const sharp = require("sharp");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");

// Store file in memory first
const storage = multer.memoryStorage();

// Accept images and videos only
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|mkv|avi/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.test(ext)) cb(null, true);
  else cb(new Error("Only images and videos are allowed"));
};

const upload = multer({ storage, fileFilter });

// Middleware to compress file before controller
const compressFile = async (req, res, next) => {
  try {
    if (!req.file) return next();

    const ext = path.extname(req.file.originalname).toLowerCase();
    const filename = Date.now() + ext;
    const uploadDir = path.join(__dirname, "../uploads/");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const uploadPath = path.join(uploadDir, filename);

    if ([".jpg", ".jpeg", ".png"].includes(ext)) {
      // IMAGE: resize + save
      await sharp(req.file.buffer)
        .resize({ width: 1080 }) // max width
        .toFile(uploadPath);
    } else {
      // VIDEO: save temporarily
      fs.writeFileSync(uploadPath, req.file.buffer);
      // optional: compress video
      const compressedPath = path.join(uploadDir, "compressed-" + filename);
      await new Promise((resolve, reject) => {
        ffmpeg(uploadPath)
          .outputOptions(["-preset ultrafast", "-crf 23"])
          .save(compressedPath)
          .on("end", () => {
            fs.unlinkSync(uploadPath); // delete original
            resolve();
          })
          .on("error", reject);
      });
      req.file.filename = "compressed-" + filename; // controller will use this
    }

    // Attach path so controller can save it directly
    req.file.path = `/uploads/${req.file.filename || filename}`;

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { upload, compressFile };
