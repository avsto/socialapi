const mongoose = require("mongoose");

const OtpSchema = new mongoose.Schema({
    phone: String,
    otp: String,
    expiresAt: Date,
});

module.exports = mongoose.model("Otp", OtpSchema);
