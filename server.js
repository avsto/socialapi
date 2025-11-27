require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const postRoutes = require("./routes/postRoutes");
const walletRoutes = require("./routes/walletRoutes");
const messageRoutes = require("./routes/messageRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/messages", messageRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => res.send('API is running'));

// --------------------------
// SOCKET.IO SETUP
// --------------------------
const server = app.listen(PORT, () => 
    console.log(`Server started on port ${PORT}`)
);

const io = require("socket.io")(server, {
    cors: { origin: "*" }
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join", (userId) => {
        onlineUsers.set(userId, socket.id);
    });

    socket.on("send-message", (data) => {
        const receiverSocket = onlineUsers.get(data.receiver);
        if (receiverSocket) {
            io.to(receiverSocket).emit("receive-message", data);
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected", socket.id);
    });
});

global.io = io;
