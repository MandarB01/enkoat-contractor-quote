/**
 * Global Error Handler Middleware
 *
 * This middleware handles all errors in the application, providing
 * appropriate error responses based on the environment and error type.
 * It includes special handling for common MongoDB and validation errors.
 */

const AppError = require("../utils/AppError");
const logger = require("../utils/loggerUtil"); // Import the logger utility

/**
 * Handles Mongoose CastError (invalid MongoDB ObjectId)
 * @private
 */
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

/**
 * Handles MongoDB duplicate key errors
 * @private
 */
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

/**
 * Handles Mongoose validation errors
 * @private
 */
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

/**
 * Handles JSON parsing errors
 * @private
 */
const handleJSONParseError = () => {
  return new AppError("Invalid JSON format in request body", 400);
};

/**
 * Handles generic Mongoose errors
 * @private
 */
const handleMongooseError = (err) => {
  if (err.name === "MongooseError") {
    return new AppError("Database operation failed. Please try again.", 500);
  }
  return err;
};

/**
 * Handles MongoDB server connection errors
 * @private
 */
const handleMongoServerError = () => {
  return new AppError(
    "Database connection error. Please try again later.",
    503
  );
};

/**
 * Sends detailed error response in development environment
 * @private
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

/**
 * Sends simplified error response in production environment
 * @private
 */
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  // Programming or other unknown error: don't leak error details
  else {
    // Log error for debugging using the logger utility
    logger.error("ERROR 💥", err);

    // Send generic message
    res.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  }
};

/**
 * Global error handling middleware
 * This is the last middleware in the chain and handles all errors
 * that are passed to next(error) from other parts of the application
 */
module.exports = (err, req, res, next) => {
  // If headers already sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  // Default error status and code if not set
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Log the error regardless of environment, using the utility
  // In production, sensitive details might be stripped later if needed by logger config
  // In development, loggerUtil currently just uses console.error
  logger.error(
    `${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`,
    err.stack // Include stack trace for better debugging
  );

  // Different error handling for development and production/test
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else {
    // Treat 'test' and 'production' similarly for error response structure
    let error = { ...err }; // Create a copy to avoid modifying the original error
    error.message = err.message;

    // Handle specific error types
    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);
    if (error.type === "entity.parse.failed") error = handleJSONParseError();
    if (error.name === "MongooseError") error = handleMongooseError(error);
    if (error.name === "MongoServerError") error = handleMongoServerError();

    sendErrorProd(error, res);
  }
};
