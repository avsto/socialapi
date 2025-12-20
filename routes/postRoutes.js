const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const protect = require("../middlewares/authMiddleware");

const { upload, compressFile } = require("../middlewares/upload");

// Create post
router.post("/add", protect, upload.single("image"), compressFile, postController.createPost);

// Like / Unlike
router.post("/like/:postId", protect, postController.likePost);
router.get("/getLikes/:id", protect, postController.getLikesOfPost);

// share
router.get("/getShares/:id", protect, postController.getSharesOfPost);


// Add comment
router.post("/comment/:postId", protect, postController.addComment);
router.get("/getComments/:postId", protect, postController.getCommentsOfPost);

// Get all posts
router.get("/", protect, postController.getPosts);
router.get("/getVideoPosts", protect, postController.getVideoPosts);
router.get("/:postId", protect, postController.getPostDetail);

module.exports = router;
