const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  caption: { type: String },

  image: { type: String },

  // LIKES
  likes: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  ],

  // COMMENTS
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      text: { type: String },
      createdAt: { type: Date, default: Date.now },
    },
  ],

  // ⭐ NEW FIELD — SHARE FEATURE
  shares: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User" } // user IDs who shared
  ],

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Post", PostSchema);
