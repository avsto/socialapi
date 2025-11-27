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

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
