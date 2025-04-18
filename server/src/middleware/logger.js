/**
 * Logging Middleware Configuration
 *
 * Configures request logging for the application using Morgan.
 * Implements different logging formats and destinations based on
 * the environment (development vs production).
 *
 * Features:
 * - Separate logs for access and errors
 * - Different formats for development and production
 * - Automatic log directory creation
 * - Custom logging tokens
 */

const morgan = require("morgan");
const fs = require("fs");
const path = require("path");

/**
 * Create logs directory if it doesn't exist
 * Ensures the logging system has a place to write files
 */
const logsDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

/**
 * Create write streams for different log types
 * Separates access and error logs for better organization
 */
const accessLogStream = fs.createWriteStream(path.join(logsDir, "access.log"), {
  flags: "a",
});

const errorLogStream = fs.createWriteStream(path.join(logsDir, "error.log"), {
  flags: "a",
});

/**
 * Custom morgan tokens
 * Adds additional information to log entries
 */
morgan.token("body", (req) => JSON.stringify(req.body));
morgan.token("error", (req, res) => res.locals.errorMessage || "");

/**
 * Different log formats for different environments
 * Development format includes more details for debugging
 * Production format follows standard Apache combined log format
 */
const developmentFormat = `:method :url :status :response-time ms - :res[content-length] - :body`;

const productionFormat = `:remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"`;

/**
 * Development logging configuration
 * Outputs colored logs to console for successful requests
 */
const developmentLogger = morgan(developmentFormat, {
  skip: (req, res) => res.statusCode >= 400,
});

/**
 * Development error logging configuration
 * Outputs errors to stderr with color coding
 */
const developmentErrorLogger = morgan(developmentFormat, {
  skip: (req, res) => res.statusCode < 400,
  stream: process.stderr,
});

/**
 * Production logging configuration
 * Writes successful requests to access.log
 */
const productionLogger = morgan(productionFormat, {
  skip: (req, res) => res.statusCode >= 400,
  stream: accessLogStream,
});

/**
 * Production error logging configuration
 * Writes errors to error.log
 */
const productionErrorLogger = morgan(productionFormat, {
  skip: (req, res) => res.statusCode < 400,
  stream: errorLogStream,
});

/**
 * Export middleware based on environment
 * Uses appropriate loggers based on NODE_ENV
 */
module.exports = (req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    developmentLogger(req, res, (err) => {
      if (err) return next(err);
      developmentErrorLogger(req, res, next);
    });
  } else {
    productionLogger(req, res, (err) => {
      if (err) return next(err);
      productionErrorLogger(req, res, next);
    });
  }
};
