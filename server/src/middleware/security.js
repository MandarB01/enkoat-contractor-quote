/**
 * Security Middleware Configuration
 *
 * Implements various security measures to protect the application from
 * common web vulnerabilities. This includes:
 * - Content Security Policy (CSP)
 * - Cross-Origin protection
 * - XSS protection
 * - NoSQL injection protection
 * - Parameter pollution protection
 */

const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

/**
 * Configures security middleware for the Express application
 * @param {Express} app - Express application instance
 */
const securityMiddleware = (app) => {
  // Set security HTTP headers using helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "blob:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'", "data:"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: true,
      crossOriginOpenerPolicy: true,
      crossOriginResourcePolicy: { policy: "same-site" },
    })
  );

  // Data sanitization against NoSQL query injection
  app.use(
    mongoSanitize({
      onSanitize: ({ req, key }) => {
        console.warn(`Warning: Data sanitized for key: ${key}`);
      },
    })
  );

  // Data sanitization against XSS
  app.use(xss());

  // Prevent parameter pollution
  app.use(
    hpp({
      whitelist: ["state", "roofType", "page", "limit"],
    })
  );

  // Add additional security headers
  app.use((req, res, next) => {
    // Prevent browsers from MIME-sniffing
    res.setHeader("X-Content-Type-Options", "nosniff");

    // Prevent clickjacking
    res.setHeader("X-Frame-Options", "DENY");

    // Enable browser XSS filter
    res.setHeader("X-XSS-Protection", "1; mode=block");

    // Enforce HTTPS
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );

    // Control browser features
    res.setHeader(
      "Permissions-Policy",
      "geolocation=(), camera=(), microphone=(), payment=()"
    );

    next();
  });

  if (process.env.NODE_ENV === "production") {
    // Force HTTPS in production
    app.use((req, res, next) => {
      if (req.header("x-forwarded-proto") !== "https") {
        res.redirect(`https://${req.header("host")}${req.url}`);
      } else {
        next();
      }
    });
  }
};

module.exports = securityMiddleware;
