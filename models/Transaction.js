const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
        amount: { type: Number, required: true },
        type: { type: String, default: "like_earning" },
        message: { type: String },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Transaction", TransactionSchema);
