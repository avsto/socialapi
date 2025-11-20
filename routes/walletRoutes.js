const express = require('express');
const router = express.Router();

const { withdrawRequest, getWalletHistory } = require("../controllers/walletController");
const protect = require('../middlewares/authMiddleware');

router.post("/withdraw", protect, withdrawRequest);
router.get("/history", protect, getWalletHistory);

module.exports = router;
