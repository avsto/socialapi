const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const authMiddleware = require("../middleware/auth");

// send message
router.post("/send", authMiddleware, messageController.sendMessage);

// get chat between two users
router.get("/chat/:userId", authMiddleware, messageController.getChat);

// chat list (latest messages)
router.get("/list", authMiddleware, messageController.chatList);

// mark message seen
router.put("/seen/:messageId", authMiddleware, messageController.markSeen);

// delete message
router.delete("/delete/:messageId", authMiddleware, messageController.deleteMessage);

module.exports = router;
