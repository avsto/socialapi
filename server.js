require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const authRoutes = require('./routes/authRoutes');
const postRoutes = require("./routes/postRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json()); // parse JSON

// routes
app.use('/api/auth', authRoutes);
app.use("/api/posts", upload.single("image"), postRoutes);

app.get('/', (req, res) => res.send('API is running'));

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
