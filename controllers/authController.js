const bcrypt = require('bcryptjs');
const otpGenerator = require("otp-generator");
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Device = require('../models/Device');
const Otp = require("../models/Otp");
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '100Y';

function generateToken(user) {
  return jwt.sign(
    { id: user._id, username: user.username },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/* -------------------------------------
   REGISTER
--------------------------------------*/
exports.register = async (req, res) => {
  try {
    const { username, password, name } = req.body;

    if (!username || !password)
      return res.status(400).json({ status: false, message: 'Missing fields' });

    const existing = await User.findOne({ username });
    if (existing)
      return res.status(400).json({ status: false, message: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: name,
      phone: username,
      name: name,
      password: hashed
    });

    const token = generateToken(user);

    res.json({ status: true, token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Server error' });
  }
};

/* -------------------------------------
   LOGIN
--------------------------------------*/
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ status: false, message: 'Missing fields' });

    const user = await User.findOne({ phone: username });
    if (!user)
      return res.status(401).json({ status: false, message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok)
      return res.status(401).json({ status: false, message: 'Invalid credentials' });

    const token = generateToken(user);

    res.json({ status: true, token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Server error' });
  }
};

/* -------------------------------------
   GET LOGGED-IN USER /me
--------------------------------------*/
exports.me = async (req, res) => {
  try {
    if (!req.user)
      return res.status(401).json({ status: false, message: 'Unauthorized' });

    const user = await User.findById(req.user.id).select('-password');
    res.json({ status: true, user });

  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Server error' });
  }
};



/* -------------------------------------
   update token   ⭐ NEW
--------------------------------------*/

exports.saveDeviceToken = async (req, res) => {
  try {
    if (!req.user)
      return res.status(401).json({ status: false, message: 'Unauthorized' });

    const userId = req.user._id;
    const {
      fcmToken,
      deviceId,
      deviceType,
      deviceModel,
      osVersion,
      appVersion,
    } = req.body;

    if (!fcmToken || !deviceId || !deviceType) {
      return res.status(400).json({
        status: false,
        message: "Missing required fields",
      });
    }

    await Device.findOneAndUpdate(
      { fcmToken },
      {
        user: userId,
        deviceId,
        deviceType,
        deviceModel,
        osVersion,
        appVersion,
        isActive: true,
        lastUsedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({ status: true, message: "Device token saved" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

/* -------------------------------------
   UPDATE USER PROFILE   ⭐ NEW
--------------------------------------*/
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { name, username, bio } = req.body;

    let updatedData = {
      name,
      username,
      bio
    };
    if (req.file) {
      updatedData.profile_image = `/uploads/${req.file.filename}`;
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updatedData },
      { new: true }
    ).select("-password");

    res.json({ status: true, message: "Profile updated", user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, message: "Server error" });
  }
};


/**
 * 📲 Send OTP
 */
exports.sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || phone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number",
      });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const otp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    await Otp.deleteMany({ phone });

    await Otp.create({
      phone,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    res.json({
      success: true,
      otp: otp,
      message: "OTP sent successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * ✅ Verify OTP
 */
exports.verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    const record = await Otp.findOne({ phone });

    if (!record) {
      return res.status(400).json({
        success: false,
        message: "OTP not found or expired",
      });
    }

    if (record.expiresAt < new Date()) {
      await Otp.deleteOne({ phone });
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    if (record.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    res.json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 🔁 Reset Password
 */
exports.resetPassword = async (req, res) => {
  try {
    const { phone, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    await Otp.deleteMany({ phone });

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};