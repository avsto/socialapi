const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');
const protect = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');

router.post('/register', controller.register);
router.post('/login', controller.login);
router.get('/me', protect, controller.me);

// 👇 Add multer here
router.put('/update', protect, upload.single("profile_image"), controller.updateProfile);

module.exports = router;
