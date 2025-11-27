require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require("./routes/postRoutes");
const walletRoutes = require("./routes/walletRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json()); // parse JSON

// routes
app.use('/api/auth', authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/messages", require("./routes/messageRoutes"));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => res.send('API is running'));

// ---- SOCKET.IO SETUP ----
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET","POST"]
    }
});

// make io globally accessible
global.io = io;

io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

// start server with Socket.IO
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
