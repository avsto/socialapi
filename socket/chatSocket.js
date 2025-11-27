let onlineUsers = new Map();

module.exports = (io) => {

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // USER JOINS WITH ID
    socket.on("join", (userId) => {
      onlineUsers.set(userId, socket.id);
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    });

    // TYPING INDICATOR
    socket.on("typing", ({ senderId, receiverId }) => {
      const receiverSocket = onlineUsers.get(receiverId);
      if (receiverSocket) {
        io.to(receiverSocket).emit("typing", { senderId });
      }
    });

    // STOPPED TYPING
    socket.on("stopTyping", ({ senderId, receiverId }) => {
      const receiverSocket = onlineUsers.get(receiverId);
      if (receiverSocket) {
        io.to(receiverSocket).emit("stopTyping", { senderId });
      }
    });

    // SEND MESSAGE
    socket.on("sendMessage", (data) => {
      const receiverSocket = onlineUsers.get(data.receiverId);

      // SEND TO RECEIVER IF ONLINE
      if (receiverSocket) {
        io.to(receiverSocket).emit("newMessage", data);
      }
    });

    // SEEN MESSAGE
    socket.on("messageSeen", ({ messageId, senderId }) => {
      const senderSocket = onlineUsers.get(senderId);
      if (senderSocket) {
        io.to(senderSocket).emit("seenUpdate", { messageId });
      }
    });

    // DISCONNECT
    socket.on("disconnect", () => {
      for (let [key, value] of onlineUsers.entries()) {
        if (value === socket.id) onlineUsers.delete(key);
      }
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    });
  });
};
