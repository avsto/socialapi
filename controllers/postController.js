const Post = require("../models/Post");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
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

    const userId = req.user._id;
    const postOwnerId = post.user;

    const likedIndex = post.likes.indexOf(userId);
    let moneyAdded = 1;

    if (likedIndex === -1) {
      // LIKE
      post.likes.push(userId);

      // Add earning history
      await Wallet.create({
        user: postOwnerId,
        type: "earning",
        amount: moneyAdded,
        postId: post._id
      });

      await User.findByIdAndUpdate(postOwnerId, {
        $inc: { wallet: moneyAdded }
      });

    } else {
      // UNLIKE
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
    res.status(500).json({ message: "Server error" });
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
