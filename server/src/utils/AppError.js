/**
 * Custom Error Class for Application Errors
 *
 * This class extends the built-in Error class to provide additional
 * functionality for handling operational errors in the application.
 * It includes features like status codes and error classification.
 */

class AppError extends Error {
  /**
   * Creates a new AppError instance
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code (default: 500)
   */
  constructor(message, statusCode = 500) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";

    // Flag to identify operational errors (vs programming errors)
    this.isOperational = true;

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Creates a 400 Bad Request error
   * @param {string} message - Error message
   * @returns {AppError} - New AppError instance
   */
  static badRequest(message) {
    return new AppError(message, 400);
  }

  /**
   * Creates a 401 Unauthorized error
   * @param {string} message - Error message
   * @returns {AppError} - New AppError instance
   */
  static unauthorized(message) {
    return new AppError(message || "Unauthorized access", 401);
  }

  /**
   * Creates a 403 Forbidden error
   * @param {string} message - Error message
   * @returns {AppError} - New AppError instance
   */
  static forbidden(message) {
    return new AppError(message || "Forbidden access", 403);
  }

  /**
   * Creates a 404 Not Found error
   * @param {string} message - Error message
   * @returns {AppError} - New AppError instance
   */
  static notFound(message) {
    return new AppError(message || "Resource not found", 404);
  }

  /**
   * Creates a 409 Conflict error
   * @param {string} message - Error message
   * @returns {AppError} - New AppError instance
   */
  static conflict(message) {
    return new AppError(message || "Resource conflict", 409);
  }

  /**
   * Creates a 422 Unprocessable Entity error
   * @param {string} message - Error message
   * @returns {AppError} - New AppError instance
   */
  static validation(message) {
    return new AppError(message || "Validation failed", 422);
  }

  /**
   * Creates a 500 Internal Server error
   * @param {string} message - Error message
   * @returns {AppError} - New AppError instance
   */
  static internal(message) {
    return new AppError(message || "Internal server error", 500);
  }
}

module.exports = AppError;
