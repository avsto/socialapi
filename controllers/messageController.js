const Message = require('../models/Message');
const User = require('../models/User');

// Send message
exports.sendMessage = async (req, res) => {
    try {
        const { receiver, message, media_url, media_type } = req.body;

        const newMessage = await Message.create({
            sender: req.user._id,
            receiver,
            message,
            media_url,
            media_type
        });

        res.json({
            success: true,
            message: "Message sent",
            data: newMessage
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get chat between two users
exports.getChat = async (req, res) => {
    try {
        const { userId } = req.params;

        const messages = await Message.find({
            $or: [
                { sender: req.user._id, receiver: userId },
                { sender: userId, receiver: req.user._id }
            ],
            deletedBy: { $ne: req.user._id }
        }).sort({ createdAt: 1 });

        res.json({ success: true, data: messages });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Chat list (last message for each user)
exports.chatList = async (req, res) => {
    try {
        const userId = req.user._id;

        const chats = await Message.aggregate([
            {
                $match: {
                    $or: [{ sender: userId }, { receiver: userId }]
                }
            },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: {
                        users: {
                            $cond: [
                                { $eq: ["$sender", userId] },
                                "$receiver",
                                "$sender"
                            ]
                        }
                    },
                    lastMessage: { $first: "$$ROOT" }
                }
            }
        ]);

        res.json({ success: true, data: chats });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Mark message as seen
exports.markSeen = async (req, res) => {
    try {
        const { messageId } = req.params;

        await Message.findByIdAndUpdate(messageId, { isSeen: true });

        res.json({ success: true, message: "Seen updated" });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Delete message for one user
exports.deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;

        await Message.findByIdAndUpdate(messageId, {
            $addToSet: { deletedBy: req.user._id }
        });

        res.json({ success: true, message: "Message deleted for you" });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
