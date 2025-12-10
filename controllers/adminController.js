const bcryptjs = require('bcryptjs');
const User = require('../models/User');
const Post = require("../models/Post");

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