const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Type: earning = like income, withdraw = payout request
    type: { 
      type: String, 
      enum: ["earning", "withdraw"], 
      required: true 
    },

    amount: { type: Number, required: true },

    // For post like earning history
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", default: null },

    // Withdrawal status
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    // Withdrawal method
    method: { 
      type: String, 
      enum: ["UPI", "Bank"], 
      default: null 
    },

    // UPI withdrawal
    upiId: { type: String, default: null },

    // Bank withdrawal
    accountNumber: { type: String, default: null },
    ifscCode: { type: String, default: null },

    note: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Wallet", walletSchema);
