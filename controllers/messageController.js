const Message = require('../models/Message');
const User = require('../models/User');

exports.sendMessage = async (req, res) => {
    try {
        const { receiver, message, media_url = null, media_type = null } = req.body;
        const senderId = req.user._id;

        if (!receiver || !message) {
            return res.status(400).json({ message: "Receiver ID and message content are required." });
        }
        // Create new message in the database
        const newMsg = await Message.create({
            sender: senderId,
            receiver,
            message,
            media_url,
            media_type,
        });

        const io = global.io;

        if (io) {
            io.to(receiver.toString()).emit("receive-message", newMsg);
            io.to(senderId.toString()).emit("receive-message", newMsg);
        }

        return res.status(201).json({
            success: true,
            data: newMsg,
            message: "Message sent successfully and emitted via socket."
        });

    } catch (error) {
        console.error("Send Message Error:", error);
        return res.status(500).json({ message: "Server error" });
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

// Chat list (latest message)
exports.chatList = async (req, res) => {
    try {
        const userId = req.user._id;

        const chats = await Message.aggregate([
            {
                $match: {
                    deletedBy: { $ne: userId },
                    $or: [
                        { sender: userId },
                        { receiver: userId }
                    ]
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
                    lastMessage: { $first: "$$ROOT" },
                    unread: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$receiver", userId] },
                                        { $eq: ["$isSeen", false] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            },

            // Convert _id.users (ObjectId) into real user document
            {
                $lookup: {
                    from: "users",
                    localField: "_id.users",
                    foreignField: "_id",
                    as: "user"
                }
            },

            { $unwind: "$user" },

            // Populate sender
            {
                $lookup: {
                    from: "users",
                    localField: "lastMessage.sender",
                    foreignField: "_id",
                    as: "lastMessage.sender"
                }
            },
            { $unwind: "$lastMessage.sender" },

            // Populate receiver
            {
                $lookup: {
                    from: "users",
                    localField: "lastMessage.receiver",
                    foreignField: "_id",
                    as: "lastMessage.receiver"
                }
            },
            { $unwind: "$lastMessage.receiver" }
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

// Delete message
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
