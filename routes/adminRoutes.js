const express = require("express");
const router = express.Router();
const protect = require('../middlewares/adminMiddleware');
const adminController = require("../controllers/adminController");

// Login pages
router.get("/login", adminController.loginPage);
router.post("/login", adminController.login);

// Dashboard (protected)
router.get("/dashboard", protect, adminController.dashboard);
router.get("/users", protect, adminController.users);
router.get("/payout", protect, adminController.payout);

module.exports = router;
