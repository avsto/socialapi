const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    message: {
        type: String,
        default: ""
    },
    media_url: {
        type: String,
        default: null
    },
    media_type: {
        type: String,
        enum: ["image", "video", "audio", null],
        default: null
    },
    isSeen: {
        type: Boolean,
        default: false
    },
    deletedBy: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
        default: []
    }
}, { timestamps: true });

module.exports = mongoose.model("Message", MessageSchema);
