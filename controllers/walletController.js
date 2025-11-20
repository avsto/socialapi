const Wallet = require("../models/Wallet");
const User = require("../models/User");

exports.withdrawRequest = async (req, res) => {
  try {
    const userId = req.user._id;
    const { amount, method, upiId, accountNumber, ifscCode } = req.body;

    // Basic validations
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ status: false, message: "Enter valid amount" });
    }

    if (!method || !["UPI", "Bank", "Direct"].includes(method)) {
      return res.status(400).json({ status: false, message: "Invalid withdrawal method" });
    }

    // Method-specific validations
    if (method === "UPI" && !upiId) {
      return res.status(400).json({ status: false, message: "UPI ID required" });
    }

    if (method === "Bank" && (!accountNumber || !ifscCode)) {
      return res.status(400).json({ status: false, message: "Bank details required" });
    }

    const user = await User.findById(userId);

    if (user.wallet < amount) {
      return res.status(400).json({
        status: false,
        message: "Insufficient wallet balance"
      });
    }

    // SAVE withdrawal request inside Wallet table
    const request = await Wallet.create({
      user: userId,
      type: "withdraw",
      amount,
      method,
      upiId: method === "UPI" ? upiId : null,
      accountNumber: method === "Bank" ? accountNumber : null,
      ifscCode: method === "Bank" ? ifscCode : null,
      status: "pending",
    });

    // Deduct from user wallet
    await User.findByIdAndUpdate(userId, {
      $inc: { wallet: -amount }
    });

    res.json({
      status: true,
      message: "Withdrawal request submitted",
      request
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: "Server error"
    });
  }
};


exports.getWalletHistory = async (req, res) => {
  try {
    const history = await Wallet.find({ user: req.user._id })
      .populate("postId", "caption image")
      .sort({ createdAt: -1 });

    res.json({
      status: true,
      history
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
