const Post = require("../models/Post");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
// Create Post
exports.createPost = async (req, res) => {
  try {
    const { caption } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const post = await Post.create({
      user: req.user._id,
      caption,
      image,
      likes: []
    });

    res.json({ status: true, post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

// Like / Unlike Post
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const likerId = req.user._id;
    const postOwnerId = post.user.toString();

    const likedIndex = post.likes.indexOf(likerId);

    let moneyAdded = 0;

    // -----------------------------
    // LIKE
    // -----------------------------
    if (likedIndex === -1) {
      post.likes.push(likerId);

      // Random earning or fixed
      moneyAdded = 1; // Fixed for now

      // Add to post owner's wallet
      await User.findByIdAndUpdate(postOwnerId, {
        $inc: { wallet: moneyAdded }
      });

      // Create transaction entry
      await Transaction.create({
        user: postOwnerId,
        fromUser: likerId,
        post: post._id,
        amount: moneyAdded,
        type: "like_earning",
        message: "You earned from post like"
      });

    } else {
      // -----------------------------
      // UNLIKE
      // -----------------------------
      post.likes.splice(likedIndex, 1);
      moneyAdded = 0;
    }

    await post.save();

    return res.json({
      status: true,
      likesCount: post.likes.length,
      moneyAdded
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Server error" });
  }
};


// Add comment
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({ user: req.user._id, text });
    await post.save();

    res.json({ status: true, comments: post.comments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

// Get posts
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username name profile_image")
      .populate("comments.user", "username name profile_image")
      .sort({ createdAt: -1 });

    const formatted = posts.map((post) => ({
      _id: post._id,
      caption: post.caption,
      image: post.image,
      user: post.user,
      likes: post.likes,
      likesCount: post.likes.length,
      comments: post.comments,
      createdAt: post.createdAt,
    }));

    res.json({ status: true, posts: formatted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Server error" });
  }
};
