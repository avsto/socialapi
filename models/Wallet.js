const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  type: { type: String, enum: ["earning", "withdraw"], required: true },

  amount: { type: Number, required: true },

  postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", default: null },

  status: { 
    type: String, 
    enum: ["pending", "approved", "rejected"], 
    default: "pending" 
  },

}, { timestamps: true });

module.exports = mongoose.model("Wallet", walletSchema);
