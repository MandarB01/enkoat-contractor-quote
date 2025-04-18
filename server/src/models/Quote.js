/**
 * Quote Model - Defines the schema for contractor quote submissions
 *
 * This model represents the structure of a roofing project quote submission.
 * It includes contractor information, project specifications, and location details.
 * The schema includes validation rules to ensure data integrity.
 */

const mongoose = require("mongoose");
const {
  sanitizeString,
  validateRoofSize,
  validateStateCode,
  validateDate,
  validateRoofType,
} = require("../utils/validation");

/**
 * Quote Schema
 * @typedef {Object} Quote
 * @property {string} contractorName - Name of the contractor submitting the quote
 * @property {string} company - Company name of the contractor
 * @property {number} roofSize - Size of the roof in square feet
 * @property {string} roofType - Type of roof (Metal, TPO, Foam, Other)
 * @property {string} projectCity - City where the project is located
 * @property {string} projectState - Two-letter state code for project location
 * @property {Date} projectDate - Planned date for the project
 * @property {Date} createdAt - Timestamp of quote submission
 */
const quoteSchema = new mongoose.Schema(
  {
    contractorName: {
      type: String,
      required: [true, "Contractor name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [100, "Name cannot exceed 100 characters"],
      set: sanitizeString,
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      minlength: [2, "Company name must be at least 2 characters long"],
      maxlength: [100, "Company name cannot exceed 100 characters"],
      set: sanitizeString,
    },
    roofSize: {
      type: Number,
      required: [true, "Roof size is required"],
      validate: {
        validator: validateRoofSize,
        message:
          "Invalid roof size. Must be between 1 and 1,000,000 square feet",
      },
    },
    roofType: {
      type: String,
      required: [true, "Roof type is required"],
      validate: {
        validator: validateRoofType,
        message: "Invalid roof type. Must be Metal, TPO, Foam, or Other",
      },
    },
    projectCity: {
      type: String,
      required: [true, "Project city is required"],
      trim: true,
      set: sanitizeString,
    },
    projectState: {
      type: String,
      required: [true, "Project state is required"],
      uppercase: true,
      validate: {
        validator: validateStateCode,
        message: "Invalid state code. Must be a 2-letter US state code",
      },
    },
    projectDate: {
      type: Date,
      required: [true, "Project date is required"],
      validate: {
        validator: validateDate,
        message: "Project date must be between now and 2 years from now",
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add index for better query performance
quoteSchema.index({ projectState: 1, roofType: 1 });
quoteSchema.index({ createdAt: -1 });

// Virtual for full location
quoteSchema.virtual("location").get(function () {
  return `${this.projectCity}, ${this.projectState}`;
});

const Quote = mongoose.model("Quote", quoteSchema);

module.exports = Quote;
