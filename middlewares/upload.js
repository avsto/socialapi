const multer = require("multer");
const path = require("path");
const sharp = require("sharp");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");

// SET FFmpeg PATH (important for Linux servers)
ffmpeg.setFfmpegPath("/usr/bin/ffmpeg");

// Use memory storage (fast)
const storage = multer.memoryStorage();

// Accept only images & videos
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|mp4|mov|mkv|avi|webm/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext)) cb(null, true);
  else cb(new Error("Only images & videos allowed"));
};

const upload = multer({ storage, fileFilter });


// ------------ COMPRESS MIDDLEWARE ------------
const compressFile = async (req, res, next) => {
  try {
    if (!req.file) return next();

    const ext = path.extname(req.file.originalname).toLowerCase();
    const uploadDir = path.join(__dirname, "../uploads/");

    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const filename = Date.now() + ext;
    const uploadPath = path.join(uploadDir, filename);

    // ========== IMAGE ==========
    if ([".jpg", ".jpeg", ".png"].includes(ext)) {
      await sharp(req.file.buffer)
        .resize({ width: 1080 }) // fast + high quality
        .jpeg({ quality: 80 })
        .toFile(uploadPath);

      req.file.filename = filename;
      req.file.path = `/uploads/${filename}`;
      return next();
    }

    // ========== VIDEO ==========
    // Save buffer temporarily
    fs.writeFileSync(uploadPath, req.file.buffer);

    const compressedName = "c-" + filename;
    const compressedPath = path.join(uploadDir, compressedName);

    await new Promise((resolve, reject) => {
      ffmpeg(uploadPath)
        .videoCodec("libx264")
        .outputOptions([
          "-preset fast",
          "-crf 25",        // smaller size + good quality
          "-movflags +faststart"
        ])
        .save(compressedPath)
        .on("end", () => {
          fs.unlinkSync(uploadPath); // remove original
          resolve();
        })
        .on("error", (err) => {
          console.error("FFmpeg video compression error:", err);
          resolve(); // fallback: still continue
        });
    });

    req.file.filename = compressedName;
    req.file.path = `/uploads/${compressedName}`;

    next();
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    next(err);
  }
};

module.exports = { upload, compressFile };
