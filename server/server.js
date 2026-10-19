
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || '*'
}));

app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Connect to MongoDB when database-backed routes are requested
let connectionPromise;

app.use(async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is not configured');
      }

      if (!connectionPromise) {
        connectionPromise = mongoose.connect(process.env.MONGO_URI)
          .catch((err) => {
            connectionPromise = null;
            throw err;
          });
      }

      await connectionPromise;
    }

    next();
  } catch (err) {
    next(err);
  }
});

// Existing routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.status || 500).json({
    message: 'Server error'
  });
});

// Vercel needs the Express app exported
module.exports = app;
