const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Device = require('../models/Device');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

function generateToken(user) {
  return jwt.sign(
    { id: user._id },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/* -------------------------------------
   REGISTER
--------------------------------------*/
exports.register = async (req, res) => {
  try {
    const { phone, password, name, username } = req.body;

    if (!phone || !password)
      return res.status(400).json({ status: false, message: 'Missing fields' });

    const exists = await User.findOne({ phone });
    if (exists)
      return res.status(400).json({ status: false, message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      phone,
      username: username || phone,
      name,
      password: hashedPassword
    });

    const token = generateToken(user);

    const userData = user.toObject();
    delete userData.password;

    res.json({ status: true, token, user: userData });

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
    const { phone, password } = req.body;

    if (!phone || !password)
      return res.status(400).json({ status: false, message: 'Missing fields' });

    const user = await User.findOne({ phone });
    if (!user)
      return res.status(401).json({ status: false, message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok)
      return res.status(401).json({ status: false, message: 'Invalid credentials' });

    const token = generateToken(user);

    const userData = user.toObject();
    delete userData.password;

    res.json({ status: true, token, user: userData });

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
   SAVE DEVICE TOKEN
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
   UPDATE USER PROFILE
--------------------------------------*/
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, username, bio } = req.body;

    if (username) {
      const exists = await User.findOne({
        username,
        _id: { $ne: userId }
      });
      if (exists)
        return res.status(400).json({
          status: false,
          message: "Username already taken"
        });
    }

    const updatedData = {
      ...(name && { name }),
      ...(username && { username }),
      ...(bio && { bio }),
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
