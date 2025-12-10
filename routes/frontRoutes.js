const express = require("express");
const router = express.Router();
const frontedController = require("../controllers/frontedController");

// Privacy Policy Route
router.get("/", frontedController.home);
router.get("/privacy-policy", frontedController.privacyPolicy);

module.exports = router;