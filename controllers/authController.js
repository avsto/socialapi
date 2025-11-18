const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function generateToken(user) {
  return jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

exports.register = async (req, res) => {
  try {
    const { username, password, name } = req.body;
    if (!username || !password) return res.status(400).json({ status: false, message: 'Missing fields' });

    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ status: false, message: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, name: name || username, password: hashed });

    const token = generateToken(user);
    res.json({ status: true, token, user: { id: user._id, username: user.username, name: user.name, avatar: user.avatar } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ status: false, message: 'Missing fields' });

    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ status: false, message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ status: false, message: 'Invalid credentials' });

    const token = generateToken(user);
    res.json({ status: true, token, user: { id: user._id, username: user.username, name: user.name, avatar: user.avatar } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Server error' });
  }
};

exports.me = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ status: false, message: 'Unauthorized' });
    const user = await User.findById(req.user.id).select('-password');
    res.json({ status: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Server error' });
  }
};
