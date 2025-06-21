const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Initialize app first
const app = express();

// CORS Setup - Allow all origins for now
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Basic health check routes (these should work immediately)
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Hotel Management System API',
    status: 'running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Backend is running successfully',
    environment: process.env.NODE_ENV || 'production'
  });
});

app.get('/api/status', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Hotel Management System API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    database: process.env.MONGO_URI ? 'configured' : 'not configured'
  });
});

// Try to initialize database and routes
let dbConnected = false;
let routesLoaded = false;

try {
  require("./Models/db");
  dbConnected = true;
  console.log("Database connected successfully");
} catch (error) {
  console.log("Database connection failed:", error.message);
}

try {
  // Import Routes
  const menuRoutes = require("./Routes/menuRoutes");
  const fileRoutes = require("./Routes/PicRoutes");
  const tableRoutes = require("./Routes/tableRoutes");
  const roomRoutes = require("./Routes/roomRoutes");
  const staffRoutes = require("./Routes/staffRoutes");
  const shiftRoutes = require("./Routes/shiftroutes");
  const AuthRouter = require("./Routes/AuthRouter");
  const ProductRouter = require("./Routes/ProductRouter");
  const GoogleRoutes = require("./Routes/GoogleRoutes");
  const bookingRoutes = require("./Routes/bookingRoutes");
  const orderRoutes = require("./Routes/orderRoutes");
  const reservationRoutes = require("./Routes/ReservationRoutes");
  const userRoutes = require("./Routes/UserRoutes");
  const feedbackRoutes = require("./Routes/feedbackRoutes");
  const adminRoutes = require('./Routes/AdminRoutes');
  const paymentRoutes = require('./Routes/paymentRoutes');
  const recommendationRoutes = require('./Routes/recommendationRoutes');

  // Register Routes
  app.use("/api/menus", menuRoutes);
  app.use("/api/files", fileRoutes);
  app.use("/api/tables", tableRoutes);
  app.use("/api/rooms", roomRoutes);
  app.use("/api/staff", staffRoutes);
  app.use("/api/shift", shiftRoutes);
  app.use("/auth", AuthRouter);
  app.use("/api/products", ProductRouter);
  app.use("/auth/google", GoogleRoutes);
  app.use("/api/bookings", bookingRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/reservations", reservationRoutes);
  app.use("/api/table-reservations", reservationRoutes);
  app.use("/api/user", userRoutes);
  app.use("/api/feedback", feedbackRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/payment", paymentRoutes);
  app.use("/api/food-recommendations", recommendationRoutes);
  app.use("/api/table-recommendations", tableRoutes);

  routesLoaded = true;
  console.log("All routes loaded successfully");
} catch (error) {
  console.log("Routes loading failed:", error.message);
}

// System info endpoint
app.get('/api/system-info', (req, res) => {
  res.status(200).json({
    status: 'ok',
    database: dbConnected ? 'connected' : 'disconnected',
    routes: routesLoaded ? 'loaded' : 'failed',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      '/',
      '/api/health',
      '/api/status',
      '/api/system-info',
      '/api/rooms',
      '/api/menus',
      '/auth/login',
      '/auth/signup'
    ],
    timestamp: new Date().toISOString()
  });
});

// Export for Vercel
module.exports = app;