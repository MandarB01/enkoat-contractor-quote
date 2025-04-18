/**
 * API Routes Configuration
 *
 * Defines all API endpoints for the Contractor Quote Portal.
 * Implements rate limiting, validation, and proper route organization.
 * All routes are prefixed with /api from the main application.
 *
 * @module routes/api
 */

const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const quoteController = require("../controllers/quoteController");
const validateRequest = require("../middleware/validateRequest");
const mongoose = require("mongoose");

/**
 * Rate Limiters
 * Specific rate limits for different operations to prevent abuse
 */
const submitQuoteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 10, // limit each IP to 10 submissions per hour
  message: "Too many quote submissions, please try again in an hour",
  standardHeaders: true,
  legacyHeaders: false,
});

const getQuotesLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15-minute window
  max: 100, // limit each IP to 100 requests per window
  message: "Too many requests, please try again in 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Health Check Endpoint
 * @route GET /api/health
 * @description Check API and database health
 * @access Public
 */
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "up",
    timestamp: new Date().toISOString(),
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    message:
      mongoose.connection.readyState === 1
        ? "Successfully connected to MongoDB Atlas"
        : "Not connected to MongoDB Atlas",
  });
});

/**
 * Submit Quote Endpoint
 * @route POST /api/quotes
 * @description Submit a new contractor quote
 * @access Public
 * @rateLimited 10 requests per hour per IP
 */
router.post(
  "/quotes",
  submitQuoteLimiter,
  quoteController.validateQuote,
  validateRequest,
  quoteController.createQuote
);

/**
 * Get Quotes Endpoint
 * @route GET /api/quotes
 * @description Retrieve quotes with optional filtering
 * @access Public
 * @rateLimited 100 requests per 15 minutes per IP
 */
router.get("/quotes", getQuotesLimiter, quoteController.getQuotes);

/**
 * Generate Quote PDF Endpoint
 * @route GET /api/quotes/:id/pdf
 * @description Generate PDF document for a specific quote
 * @access Public
 * @rateLimited 100 requests per 15 minutes per IP
 */
router.get(
  "/quotes/:id/pdf",
  getQuotesLimiter,
  quoteController.generateQuotePDF
);

/**
 * Export Quotes as CSV Endpoint
 * @route GET /api/quotes/export/csv
 * @description Export all quotes as CSV file
 * @access Public
 * @rateLimited 100 requests per 15 minutes per IP
 */
router.get(
  "/quotes/export/csv",
  getQuotesLimiter,
  quoteController.exportQuotesCSV
);

module.exports = router;
