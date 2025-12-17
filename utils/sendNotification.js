const admin = require('../config/firebase');
const Device = require('../models/Device');

module.exports = async function sendNotification(userId, title, body, data = {}) {
  const devices = await Device.find({
    user: userId,
    isActive: true
  });

  if (!devices.length) return;

  const tokens = devices.map(d => d.fcmToken);

  const message = {
    notification: {
      title,
      body,
    },
    data,
    tokens,
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);

    // ❌ Invalid tokens cleanup
    response.responses.forEach(async (res, index) => {
      if (!res.success) {
        await Device.findOneAndUpdate(
          { fcmToken: tokens[index] },
          { isActive: false }
        );
      }
    });

  } catch (err) {
    console.error('FCM Error:', err);
  }
};
