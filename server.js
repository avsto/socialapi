require('dotenv').config();
const session = require("express-session");
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const walletRoutes = require('./routes/walletRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Serve static files from the "public" directory
app.use(express.static("public"));

/* -------------------------
   SESSION MUST COME FIRST
------------------------- */
app.use(session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60, // 1 hour
        httpOnly: true,
        sameSite: "lax"
    }
}));


/* -------------------------
   CORS (with credentials)
------------------------- */
app.use(cors({
    origin: true,
    credentials: true
}));


/* -------------------------
   BODY PARSER
------------------------- */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// Static Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


/* -------------------------
   API ROUTES
------------------------- */
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/wallet', walletRoutes);
app.use('/api/messages', messageRoutes);


/* -------------------------
   VIEW ENGINE (EJS)
------------------------- */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


/* -------------------------
   FRONTEND ROUTES
------------------------- */
const frontRoutes = require("./routes/frontRoutes");
app.use("/", frontRoutes);


/* -------------------------
   ADMIN ROUTES (with session)
------------------------- */
const adminRoutes = require("./routes/adminRoutes");
app.use("/admin", adminRoutes);


/* -------------------------
   SOCKET IO
------------------------- */
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: true,
        credentials: true,
        methods: ["GET", "POST"]
    }
});
global.io = io;

io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("join-room", (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined room`);
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});


/* -------------------------
   START SERVER
------------------------- */
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
