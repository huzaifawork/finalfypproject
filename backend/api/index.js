// Vercel serverless function entry point
const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import the main app configuration
const app = express();

// CORS Setup
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// Test routes
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Hotel Management System API',
    status: 'running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Backend is running successfully'
  });
});

app.get('/api/status', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Hotel Management System API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Export for Vercel
module.exports = app;