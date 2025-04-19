/**
 * Validation Utilities
 *
 * This module provides validation functions used throughout the application,
 * particularly for validating quote submissions and sanitizing input data.
 * These functions are used by both Mongoose models and Express validators.
 */

const sanitize = require("xss-clean/lib/xss").sanitize;

/**
 * Sanitizes a string input by removing potential XSS threats and invalid characters
 * @param {string} str - The input string to sanitize
 * @returns {string} - The sanitized string
 */
exports.sanitizeString = (str) => {
  if (typeof str !== "string") return str;
  // Remove any characters that aren't letters, numbers, spaces, hyphens, or apostrophes
  return str.trim().replace(/[^a-zA-Z0-9\s\-']/g, "");
};

/**
 * Validates roof size to ensure it's within acceptable range
 * @param {number} size - The roof size in square feet
 * @returns {boolean} - Whether the size is valid
 */
exports.validateRoofSize = (size) => {
  return size > 0 && size <= 1000000;
};

/**
 * Validates US state codes
 * @param {string} stateCode - Two-letter state code
 * @returns {boolean} - Whether the state code is valid
 */
exports.validateStateCode = (stateCode) => {
  const validStateCodes = [
    "AL",
    "AK",
    "AZ",
    "AR",
    "CA",
    "CO",
    "CT",
    "DE",
    "FL",
    "GA",
    "HI",
    "ID",
    "IL",
    "IN",
    "IA",
    "KS",
    "KY",
    "LA",
    "ME",
    "MD",
    "MA",
    "MI",
    "MN",
    "MS",
    "MO",
    "MT",
    "NE",
    "NV",
    "NH",
    "NJ",
    "NM",
    "NY",
    "NC",
    "ND",
    "OH",
    "OK",
    "OR",
    "PA",
    "RI",
    "SC",
    "SD",
    "TN",
    "TX",
    "UT",
    "VT",
    "VA",
    "WA",
    "WV",
    "WI",
    "WY",
  ];
  return validStateCodes.includes(stateCode.toUpperCase());
};

/**
 * Validates project dates to ensure they're within the acceptable range
 * @param {Date} date - The project date to validate
 * @returns {boolean} - Whether the date is valid
 */
exports.validateDate = (date) => {
  const now = new Date();
  const twoYearsFromNow = new Date();
  twoYearsFromNow.setFullYear(now.getFullYear() + 2);

  return date >= now && date <= twoYearsFromNow;
};

/**
 * Validates roof types against allowed values
 * @param {string} type - The roof type to validate
 * @returns {boolean} - Whether the roof type is valid
 */
exports.validateRoofType = (type) => {
  const validTypes = ["Metal", "TPO", "Foam", "Other"];
  return validTypes.includes(type);
};

/**
 * Validates email format
 * @param {string} email - The email address to validate
 * @returns {boolean} - Whether the email format is valid
 */
exports.validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates phone number format
 * @param {string} phone - The phone number to validate
 * @returns {boolean} - Whether the phone format is valid
 */
exports.validatePhone = (phone) => {
  const phoneRegex = /^\+?1?\d{10,14}$/;
  return phoneRegex.test(phone.replace(/[^\d+]/g, ""));
};

/**
 * Validates price/cost values
 * @param {number} value - The price value to validate
 * @returns {boolean} - Whether the price is valid
 */
exports.validatePrice = (value) => {
  return typeof value === "number" && value >= 0 && value <= 1000000000;
};

/**
 * Validates date strings to ensure they match the YYYY-MM-DD format.
 * Does not validate if the date itself is logically correct (e.g., Feb 30th).
 * @param {string} dateString - The date string to validate
 * @returns {boolean} - Whether the string matches the format
 */
exports.isValidDateFormat = (dateString) => {
  if (typeof dateString !== "string") {
    return false;
  }
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  return regex.test(dateString);
};
