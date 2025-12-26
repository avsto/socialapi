const bcryptjs = require('bcryptjs');
const User = require('../models/User');
const Post = require("../models/Post");
const Wallet = require("../models/Wallet");
const sendNotification = require('../utils/sendNotification');

exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.render("admin/Login", { message: "Missing fields" });
    }

    const user = await User.findOne({ phone });

    if (!user) {
      return res.render("admin/Login", { message: "Invalid credentials" });
    }

    const ok = await bcryptjs.compare(password, user.password);
    if (!ok) {
      return res.render("admin/Login", { message: "444Invalid credentials" });
    }

    req.session.admin = {
      id: user._id,
      phone: user.phone,
      name: user.name,
    };

    return res.redirect("/admin/dashboard");

  } catch (error) {
    console.error("Login Error:", error);
    return res.render("admin/Login", { message: "Server error" });
  }
};




exports.loginPage = (req, res) => {
  res.render("admin/Login");
};

exports.dashboard = async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Current page
  const limit = 10; // Users per page
  const skip = (page - 1) * limit;

  const totalUsers = await User.countDocuments();
  const totalPosts = await Post.countDocuments();
  const totalRevenue = 5000; // example

  // Paginated users
  const latestUsers = await User.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalPages = Math.ceil(totalUsers / limit);

  res.render("admin/Dashboard", {
    totalUsers,
    totalPosts,
    totalRevenue,
    latestUsers,
    currentPage: page,
    totalPages,
  });
};

exports.users = async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Current page
  const limit = 10; // Users per page
  const skip = (page - 1) * limit;

  const totalUsers = await User.countDocuments();

  // Paginated users
  const latestUsers = await User.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalPages = Math.ceil(totalUsers / limit);

  res.render("admin/Users", {

    latestUsers,
    currentPage: page,
    totalPages,
  });
};

exports.payout = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    // Total payout count
    const total = await Wallet.countDocuments({ type: "withdraw" });

    // Paginated payout history WITH POPULATED USER DETAILS
    const history = await Wallet.find({ type: "withdraw" })
      .populate("user", "name phone profile_image wallet") // 👈 get user details
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    res.render("admin/PayoutRequest", {
      history,
      currentPage: page,
      totalPages,
    });

  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
};


exports.updatepayoutstatus = async (req, res) => {
  try {
    const { id, status } = req.body;

    if (!id || !status) {
      return res.status(400).json({
        success: false,
        message: 'ID aur status required hai'
      });
    }

    const allowedStatus = ['pending', 'approved', 'rejected'];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Withdraw payout find
    const payout = await Wallet.findOne({
      _id: id,
      type: 'withdraw'
    });

    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Payout request nahi mila'
      });
    }

    // Same status dobara na ho
    if (payout.status === status) {
      return res.status(400).json({
        success: false,
        message: `Payout already ${status} hai`
      });
    }

    const user = await User.findById(payout.user);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User nahi mila'
      });
    }

    // 🔥 Reject hone par wallet refund
    if (status === 'rejected') {
      user.wallet += payout.amount;
      await user.save();
    }

    // Status update
    payout.status = status;
    await payout.save();

    // 🔔 Notification messages (status wise)
    let title = '';
    let message = '';

    if (status === 'approved') {
      title = 'Withdrawal Approved ✅';
      message = `₹${payout.amount} ka withdrawal approve ho gaya hai.`;
    }
    else if (status === 'rejected') {
      title = 'Withdrawal Rejected ❌';
      message = `₹${payout.amount} ka withdrawal reject ho gaya hai. Amount wallet me wapas add kar diya gaya hai.`;
    }

    // 🔔 Send notification (only approved / rejected)
    if (status !== 'pending') {
      await sendNotification(
        payout.user,
        title,
        message,
        {
          type: 'PAYOUT_STATUS',
          status: status,
          amount: payout.amount.toString(),
          payoutId: payout._id.toString()
        }
      );
    }

    return res.status(200).json({
      success: true,
      message: `Payout ${status} ho gaya`,
      payout
    });

  } catch (error) {
    console.error('Update payout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};