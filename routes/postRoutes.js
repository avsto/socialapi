const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const protect = require("../middlewares/authMiddleware");

const upload = require('../middlewares/upload');

// Create post
router.post("/add", protect, upload.single("image"), postController.createPost);

// Like / Unlike
router.post("/like/:postId", protect, postController.likePost);

// Add comment
router.post("/comment/:postId", protect, postController.addComment);

// Get all posts
router.get("/", protect, postController.getPosts);

module.exports = router;
