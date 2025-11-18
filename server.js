require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json()); // parse JSON

// routes
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => res.send('API is running'));

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
