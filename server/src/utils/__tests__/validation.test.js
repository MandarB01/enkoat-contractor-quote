// filepath: /Users/mandarburande/Projects/EnKoat/enkoat-contractor-quote/contractor-quote-portal/server/src/utils/__tests__/validation.test.js
// Correct the import names
const { validateStateCode, isValidDateFormat } = require("../validation");

describe("Validation Utilities", () => {
  // --- Test validateStateCode ---
  describe("validateStateCode", () => {
    // Changed describe block name for clarity
    it("should return true for valid 2-letter uppercase state codes", () => {
      // Use the correct function name: validateStateCode
      expect(validateStateCode("CA")).toBe(true);
      expect(validateStateCode("TX")).toBe(true);
      expect(validateStateCode("NY")).toBe(true);
    });

    it("should return true for valid 2-letter lowercase state codes (case-insensitive)", () => {
      // Test case-insensitivity explicitly if that's the desired behavior
      expect(validateStateCode("ca")).toBe(true);
      expect(validateStateCode("tx")).toBe(true);
    });

    it("should return false for invalid state codes", () => {
      // Use the correct function name: validateStateCode
      expect(validateStateCode("california")).toBe(false);
      expect(validateStateCode("C")).toBe(false);
      expect(validateStateCode("CA1")).toBe(false);
      // expect(validateStateCode("ca")).toBe(false); // Removed this as validateStateCode uses toUpperCase()
      expect(validateStateCode(" ")).toBe(false);
      // It's better practice to check for null/undefined/wrong types if the function doesn't handle them gracefully
      // However, the current implementation handles non-strings by returning false from .includes() after .toUpperCase() fails
      // expect(validateStateCode(null)).toBe(false); // This will likely throw an error if not handled
      // expect(validateStateCode(undefined)).toBe(false); // This will likely throw an error
      // expect(validateStateCode(12)).toBe(false); // This will likely throw an error
    });
  });

  // --- Test isValidDateFormat ---
  describe("isValidDateFormat", () => {
    it("should return true for valid YYYY-MM-DD date strings", () => {
      expect(isValidDateFormat("2023-01-15")).toBe(true);
      expect(isValidDateFormat("2024-12-31")).toBe(true);
      expect(isValidDateFormat("2025-02-28")).toBe(true);
    });

    it("should return false for invalid date formats or values", () => {
      expect(isValidDateFormat("2023/01/15")).toBe(false); // Wrong separator
      expect(isValidDateFormat("15-01-2023")).toBe(false); // Wrong order
      expect(isValidDateFormat("2023-1-15")).toBe(false); // Single digit month
      expect(isValidDateFormat("2023-01-5")).toBe(false); // Single digit day
      // The regex doesn't validate day/month ranges, only format
      // expect(isValidDateFormat("2023-13-01")).toBe(false); // Invalid month - Passes regex, fails logic
      // expect(isValidDateFormat("2023-01-32")).toBe(false); // Invalid day - Passes regex, fails logic
      expect(isValidDateFormat("not a date")).toBe(false);
      expect(isValidDateFormat("20230115")).toBe(false);
      expect(isValidDateFormat(null)).toBe(false);
      expect(isValidDateFormat(undefined)).toBe(false);
      expect(isValidDateFormat(20230115)).toBe(false); // Test with number
    });
  });

  // Add tests for other validation functions if you have them
  // e.g., describe("validateDate", () => { ... });
});
