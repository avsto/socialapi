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

// ROUTES
app.use('/api/auth', authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/messages", messageRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => res.send('API is running'));

// ---------------------- SOCKET.IO SERVER -------------------------
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
require("./socket/chatSocket")(io);
// ----------------------------------------------------------------

http.listen(PORT, () => console.log(`Server running on port ${PORT}`));
