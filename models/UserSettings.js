const mongoose = require('mongoose');

const UserSettingsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // 💰 Earning settings
  earnings: {
    post_like_amount: {
      type: Number,
      default: 0.5 // 50 paise per like
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },

  // 🔔 Notification settings
  notifications: {
    push: { type: Boolean, default: true },
    email: { type: Boolean, default: false },
    sms: { type: Boolean, default: false }
  },

  // 🔒 Privacy settings
  privacy: {
    profile_visibility: {
      type: String,
      enum: ['public', 'private', 'followers'],
      default: 'public'
    },
    show_phone: { type: Boolean, default: false },
    show_wallet: { type: Boolean, default: false }
  },

  // ⚙️ App preferences
  preferences: {
    language: { type: String, default: 'en' },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    }
  },

  is_active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('UserSettings', UserSettingsSchema);
