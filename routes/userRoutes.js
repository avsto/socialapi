const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const protect = require('../middlewares/authMiddleware');
// Fetch full user details + posts
router.get("/details/:id", protect, userController.getUserFullDetails);

module.exports = router;
