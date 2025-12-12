const multer = require("multer");
const path = require("path");
const sharp = require("sharp");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");

// 1️⃣ Store files in memory first (multer)
const storage = multer.memoryStorage();

// 2️⃣ File filter: accept images and videos only
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|mkv|avi/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.test(ext)) cb(null, true);
  else cb(new Error("Only images and videos are allowed"));
};

// 3️⃣ Multer upload
const upload = multer({ storage, fileFilter });

// 4️⃣ Middleware to compress files
const compressFile = async (req, res, next) => {
  try {
    if (!req.file) return next();

    const ext = path.extname(req.file.originalname).toLowerCase();
    const filename = Date.now() + ext;
    const uploadDir = path.join(__dirname, "../uploads/");

    // Ensure uploads directory exists
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const uploadPath = path.join(uploadDir, filename);

    if ([".jpg", ".jpeg", ".png"].includes(ext)) {
      // ✅ IMAGE: resize + save
      await sharp(req.file.buffer)
        .resize({ width: 1080 }) // max width
        .toFile(uploadPath);

      req.file.filename = filename;
    } else {
      // ✅ VIDEO: save temporarily
      fs.writeFileSync(uploadPath, req.file.buffer);

      // Compress video using ffmpeg
      const compressedPath = path.join(uploadDir, "compressed-" + filename);

      await new Promise((resolve, reject) => {
        ffmpeg(uploadPath)
          .outputOptions(["-preset ultrafast", "-crf 23"])
          .save(compressedPath)
          .on("end", () => {
            fs.unlinkSync(uploadPath); // delete original
            req.file.filename = "compressed-" + filename;
            resolve();
          })
          .on("error", (err) => {
            console.error("FFMPEG ERROR:", err);
            reject(err);
          });
      });
    }

    // Attach path for controller
    req.file.path = `/uploads/${req.file.filename}`;

    next();
  } catch (err) {
    console.error("UPLOAD MIDDLEWARE ERROR:", err);
    res.status(500).json({ status: false, message: err.message });
  }
};

module.exports = { upload, compressFile };
