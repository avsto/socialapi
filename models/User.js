const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  name: { type: String },
  password: { type: String, required: true },
  profile_image: { type: String, default: null },
  wallet: { type: Number, default: 0 },
  bio: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);