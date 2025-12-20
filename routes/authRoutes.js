const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');
const protect = require('../middlewares/authMiddleware');
const { upload, compressFile } = require("../middlewares/upload");

// Auth
router.post('/register', controller.register);
router.post('/login', controller.login);
router.get('/me', protect, controller.me);
router.post('/saveDeviceToken', protect, controller.saveDeviceToken);

// Profile
router.put(
    '/update',
    protect,
    upload.single("profile_image"),
    compressFile,
    controller.updateProfile
);

// 🔐 Forgot Password (Phone OTP)
router.post('/send-otp', controller.sendOtp);
router.post('/verify-otp', controller.verifyOtp);
router.post('/reset-password', controller.resetPassword);

module.exports = router;
