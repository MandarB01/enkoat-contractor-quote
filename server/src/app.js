/**
 * Server Entry Point
 *
 * This is the main entry point for the Contractor Quote Portal server.
 * It configures Express, connects to MongoDB, sets up middleware,
 * and initializes all routes and error handlers.
 *
 * The server implements various security measures and best practices:
 * - CORS configuration for cross-origin requests
 * - Rate limiting for API protection
 * - Request compression for improved performance
 * - Security headers via helmet
 * - MongoDB connection with retry logic
 * - Centralized error handling
 */

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const quoteRoutes = require("./routes/api");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./middleware/logger");
const securityMiddleware = require("./middleware/security");
const { dbConfig } = require("./config/db");

const app = express();

/**
 * Security Configuration
 * Apply security middleware including headers, CORS, and rate limiting
 */
securityMiddleware(app);

// CORS Configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 86400,
  })
);

/**
 * Rate Limiting Configuration
 * Protects against brute force and DoS attacks
 */
const globalLimiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 100,
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);

/**
 * Response Compression
 * Compresses responses for better performance
 */
app.use(
  compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) return false;
      return compression.filter(req, res);
    },
  })
);

// Request parsing middleware
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Request logging
app.use(logger);

/**
 * Database Connection
 * Establishes connection to MongoDB with error handling and retry logic
 */
mongoose
  .connect(dbConfig.mongoURI, dbConfig.options)
  .then(() => {
    console.log("MongoDB Atlas connected successfully");

    // Database connection event handlers
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB Atlas connection error:", err);
      if (err.name === "MongoNetworkError") {
        console.log("Attempting to reconnect to MongoDB Atlas...");
        mongoose.connect(dbConfig.mongoURI, dbConfig.options);
      }
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB Atlas disconnected. Attempting to reconnect...");
      setTimeout(() => {
        mongoose.connect(dbConfig.mongoURI, dbConfig.options);
      }, 5000);
    });

    // Graceful shutdown handler
    process.on("SIGINT", () => {
      mongoose.connection.close(() => {
        console.log("MongoDB Atlas connection closed through app termination");
        process.exit(0);
      });
    });
  })
  .catch((err) => {
    console.error("MongoDB Atlas connection error:", err);
    if (err.name === "MongoServerSelectionError") {
      console.error(
        "Could not connect to MongoDB Atlas. Please check your connection string and network connectivity."
      );
    }
    process.exit(1);
  });

// API Routes
app.use("/api", quoteRoutes);

/**
 * 404 Handler
 * Catches requests to undefined routes
 */
app.all("*", (req, res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  err.status = "fail";
  err.statusCode = 404;
  next(err);
});

// Global error handler
app.use(errorHandler);

/**
 * Server Initialization
 * Starts the server with port fallback and error handling
 */
const startServer = (port) => {
  try {
    const server = app.listen(port, () => {
      console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${port}`
      );
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (err) => {
      console.error("UNHANDLED REJECTION! 💥 Shutting down...");
      console.error(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle uncaught exceptions
    process.on("uncaughtException", (err) => {
      console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
      console.error(err.name, err.message);
      process.exit(1);
    });

    return server;
  } catch (err) {
    if (err.code === "EADDRINUSE") {
      console.log(`Port ${port} is in use, trying ${port + 1}...`);
      return startServer(port + 1);
    }
    throw err;
  }
};

// Start the server
const initialPort = process.env.PORT || 3001;
const server = startServer(initialPort);

module.exports = app;
