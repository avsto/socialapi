require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");
const http = require("http");

const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const walletRoutes = require("./routes/walletRoutes");
const messageRoutes = require("./routes/messageRoutes");

const app = express();
const server = http.createServer(app);      // REQUIRED
const { Server } = require("socket.io");

// --- SOCKET.IO ---
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

// Store connected users
let onlineUsers = {};

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // user joins with his userId
    socket.on("join", (userId) => {
        onlineUsers[userId] = socket.id;
        io.emit("onlineUsers", onlineUsers);
    });

    // receive message and broadcast
    socket.on("newMessage", (msgData) => {
        const receiverSocket = onlineUsers[msgData.receiver];
        if (receiverSocket) {
            io.to(receiverSocket).emit("messageReceived", msgData);
        }
    });

    socket.on("disconnect", () => {
        for (let uid in onlineUsers) {
            if (onlineUsers[uid] === socket.id) {
                delete onlineUsers[uid];
            }
        }
        io.emit("onlineUsers", onlineUsers);
        console.log("User disconnected:", socket.id);
    });
});

// --------------------
//  EXPRESS APP ROUTES
// --------------------
connectDB();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/messages", messageRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => res.send("API is running"));

// Start server + socket
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
