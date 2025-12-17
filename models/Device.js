const mongoose = require("mongoose");

const DeviceSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true, },
        fcmToken: { type: String, required: true, unique: true, index: true, },
        deviceId: { type: String, required: true, },
        deviceType: { type: String, enum: ["android", "ios", "web"], required: true, },
        deviceModel: { type: String },
        osVersion: { type: String },
        appVersion: { type: String },
        isActive: { type: Boolean, default: true, },
        lastUsedAt: { type: Date, default: Date.now, },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Device", DeviceSchema);
