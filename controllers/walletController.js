const Wallet = require("../models/Wallet");
const User = require("../models/User");

exports.withdrawRequest = async (req, res) => {
  try {
    const userId = req.user._id;
    const { amount } = req.body;

    const user = await User.findById(userId);

    if (user.wallet < amount) {
      return res.status(400).json({
        status: false,
        message: "Insufficient wallet balance"
      });
    }

    // Create withdrawal request
    const request = await Wallet.create({
      user: userId,
      type: "withdraw",
      amount,
      status: "pending"
    });

    // Freeze amount from wallet (optional)
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
    res.status(500).json({ status: false, message: "Server error" });
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
