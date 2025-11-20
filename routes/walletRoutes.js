const express = require('express');
const router = express.Router();
const controller = require('../controllers/walletController');
const protect = require('../middlewares/authMiddleware');


router.get('/history', protect, controller.getTransactionHistory);

module.exports = router;
