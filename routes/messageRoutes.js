const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const protect = require('../middlewares/authMiddleware');

// send message
router.post("/send", protect, messageController.sendMessage);

// get chat between two users
router.get("/chat/:userId", protect, messageController.getChat);

// chat list (latest messages)
router.get("/list", protect, messageController.chatList);

// mark message seen
router.put("/seen/:messageId", protect, messageController.markSeen);

// delete message
router.delete("/delete/:messageId", protect, messageController.deleteMessage);

module.exports = router;
