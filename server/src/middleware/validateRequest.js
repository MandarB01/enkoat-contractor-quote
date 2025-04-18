/**
 * Request Validation Middleware
 *
 * Validates incoming requests using express-validator.
 * This middleware checks validation results and handles any validation errors
 * in a consistent way across the application.
 *
 * @module middleware/validateRequest
 */

const { validationResult } = require("express-validator");
const AppError = require("../utils/AppError");

/**
 * Validates request using express-validator results
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws {AppError} If validation fails
 */
const validateRequest = (req, res, next) => {
  // Get validation results from express-validator
  const errors = validationResult(req);

  // If there are validation errors, format them and throw an error
  if (!errors.isEmpty()) {
    // Extract error messages and format them
    const errorMessages = errors.array().map((error) => ({
      field: error.param,
      message: error.msg,
      value: error.value,
    }));

    // Create formatted error message
    const message = errorMessages
      .map((err) => `${err.field}: ${err.message}`)
      .join(". ");

    // Log validation errors in development
    if (process.env.NODE_ENV === "development") {
      console.log("Validation Errors:", errorMessages);
    }

    // Throw error to be caught by error handler
    return next(new AppError(message, 400));
  }

  // If validation passes, proceed to next middleware
  next();
};

module.exports = validateRequest;
