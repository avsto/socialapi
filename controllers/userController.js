const User = require("../models/User");
const Post = require("../models/Post");


// =======================
// GET FULL USER PROFILE
// =======================
exports.getUserFullDetails = async (req, res) => {
    try {
        const userId = req.params.id;


        // 1️⃣ Fetch User Details
        const user = await User.findById(userId).select("-password");

        if (!user) return res.status(404).json({ message: "User not found" });

        // 2️⃣ Fetch User Posts with population
        const posts = await Post.find({ user: userId }).populate("user", "name username profile_image").sort({ createdAt: -1 });

        // 3️⃣ Response
        res.json({
            user,
            totalPosts: posts.length,
            posts,
        });

    } catch (error) {
        res.status(500).json({ message: "Something went wrong", error });
    }
};
