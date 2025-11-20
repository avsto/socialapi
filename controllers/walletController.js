const Transaction = require("../models/Transaction");

exports.getTransactionHistory = async (req, res) => {
    try {
        const userId = req.user._id;

        const history = await Transaction.find({ user: userId })
            .populate("fromUser", "name username avatar")
            .populate("post", "image caption")
            .sort({ createdAt: -1 });

        res.json({
            status: true,
            history
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ status: false, message: "Server error" });
    }
};