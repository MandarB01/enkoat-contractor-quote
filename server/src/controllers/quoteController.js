/**
 * Quote Controller
 *
 * Handles all quote-related operations including submission, retrieval,
 * and document generation. Implements business logic for the quote
 * management system.
 *
 * @module controllers/quoteController
 */

const { body, validationResult } = require("express-validator");
const Quote = require("../models/Quote");
const PDFDocument = require("pdfkit");

// Validation rules for quote submission
/**
 * Quote submission validation rules
 * Defines validation rules for quote submission using express-validator
 */
exports.validateQuote = [
  body("contractorName")
    .trim()
    .isLength({ min: 2, max: 100 })
    .matches(/^[a-zA-Z\s-']+$/)
    .withMessage(
      "Contractor name must contain only letters, spaces, hyphens and apostrophes"
    )
    .escape(),
  body("company").trim().isLength({ min: 2, max: 100 }).escape(),
  body("roofSize")
    .isNumeric()
    .isFloat({ gt: 0, lt: 1000000 })
    .withMessage("Roof size must be between 1 and 1,000,000 square feet"),
  body("roofType")
    .isIn(["Metal", "TPO", "Foam", "Other"])
    .withMessage("Invalid roof type"),
  body("projectCity")
    .trim()
    .matches(/^[a-zA-Z\s-']+$/)
    .withMessage(
      "City name must contain only letters, spaces, hyphens and apostrophes"
    )
    .escape(),
  body("projectState")
    .trim()
    .isLength({ min: 2, max: 2 })
    .isUppercase()
    .matches(/^[A-Z]{2}$/)
    .withMessage("Please use 2-letter state code (e.g., CA)")
    .escape(),
  body("projectDate")
    .isDate()
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      const twoYearsFromNow = new Date();
      twoYearsFromNow.setFullYear(now.getFullYear() + 2);

      if (date < now) {
        throw new Error("Project date cannot be in the past");
      }
      if (date > twoYearsFromNow) {
        throw new Error(
          "Project date cannot be more than 2 years in the future"
        );
      }
      return true;
    }),
];

// Create a new quote submission
/**
 * Create a new quote
 * @route POST /api/quotes
 * @access Public
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with quote details or error
 *
 * @throws {400} - If validation fails
 * @throws {500} - If database operation fails
 */
exports.createQuote = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Invalid input data",
        errors: errors.array(),
      });
    }

    const newQuote = new Quote(req.body);
    await newQuote.save();
    res.status(201).json({
      message: "Quote submitted successfully",
      quote: newQuote,
    });
  } catch (error) {
    next(error);
  }
};

// Retrieve quotes with optional filtering and pagination
/**
 * Retrieve quotes with optional filtering and pagination
 * @route GET /api/quotes
 * @access Public
 *
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters for filtering
 * @param {string} [req.query.state] - Filter by state code
 * @param {string} [req.query.roofType] - Filter by roof type
 * @param {number} [req.query.page=1] - Page number for pagination
 * @param {number} [req.query.limit=10] - Number of items per page
 *
 * @returns {Object} JSON response with quotes and pagination info
 *
 * @throws {500} - If database query fails
 */
exports.getQuotes = async (req, res, next) => {
  try {
    const { state, roofType, page = 1, limit = 10 } = req.query;
    const query = {};

    if (state) query.projectState = state.toUpperCase();
    if (roofType) query.roofType = roofType;

    const options = {
      sort: { createdAt: -1 },
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
    };

    const [quotes, total] = await Promise.all([
      Quote.find(query, null, options),
      Quote.countDocuments(query),
    ]);

    res.status(200).json({
      quotes,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalQuotes: total,
        hasMore: parseInt(page) * parseInt(limit) < total,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Generate PDF for a quote
/**
 * Generate PDF document for a specific quote
 * @route GET /api/quotes/:id/pdf
 * @access Public
 *
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Quote ID
 * @param {Object} res - Express response object
 *
 * @returns {Buffer} PDF document stream
 *
 * @throws {404} - If quote not found
 * @throws {500} - If PDF generation fails
 */
exports.generateQuotePDF = async (req, res, next) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) {
      return res.status(404).json({ message: "Quote not found" });
    }

    const doc = new PDFDocument();

    // Set response headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=quote-${quote._id}.pdf`
    );

    // Pipe the PDF to the response
    doc.pipe(res);

    // Add content to PDF
    doc.fontSize(20).text("Roofing Project Quote", { align: "center" });
    doc.moveDown();

    // Company Info
    doc.fontSize(14).text("Company Information");
    doc
      .fontSize(12)
      .text(`Contractor: ${quote.contractorName}`)
      .text(`Company: ${quote.company}`);

    doc.moveDown();

    // Project Details
    doc.fontSize(14).text("Project Details");
    doc
      .fontSize(12)
      .text(`Roof Size: ${quote.roofSize} sq ft`)
      .text(`Roof Type: ${quote.roofType}`)
      .text(`Location: ${quote.projectCity}, ${quote.projectState}`)
      .text(
        `Project Date: ${new Date(quote.projectDate).toLocaleDateString()}`
      );

    doc.moveDown();

    // Footer
    doc
      .fontSize(10)
      .text("This quote is valid for 30 days from the project date.", {
        align: "center",
      });

    // Finalize PDF
    doc.end();
  } catch (error) {
    next(error);
  }
};

// Generate CSV export of quotes
/**
 * Export quotes as CSV file
 * @route GET /api/quotes/export/csv
 * @access Public
 *
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters for filtering
 * @param {string} [req.query.state] - Filter by state code
 * @param {string} [req.query.roofType] - Filter by roof type
 *
 * @returns {string} CSV file stream
 *
 * @throws {500} - If CSV generation fails
 */
exports.exportQuotesCSV = async (req, res, next) => {
  try {
    const { state, roofType } = req.query;
    const query = {};

    if (state) query.projectState = state.toUpperCase();
    if (roofType) query.roofType = roofType;

    const quotes = await Quote.find(query).sort({ createdAt: -1 });

    // CSV Headers
    const csvRows = [
      [
        "Contractor Name",
        "Company",
        "Roof Size (sq ft)",
        "Roof Type",
        "Project City",
        "Project State",
        "Project Date",
        "Submission Date",
      ],
    ];

    // Add data rows
    quotes.forEach((quote) => {
      csvRows.push([
        quote.contractorName,
        quote.company,
        quote.roofSize,
        quote.roofType,
        quote.projectCity,
        quote.projectState,
        new Date(quote.projectDate).toLocaleDateString(),
        new Date(quote.createdAt).toLocaleDateString(),
      ]);
    });

    // Convert to CSV string
    const csvContent = csvRows.map((row) => row.join(",")).join("\n");

    // Set headers for CSV download
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=quotes-${
        new Date().toISOString().split("T")[0]
      }.csv`
    );

    res.send(csvContent);
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to format quote data for documents
 * @private
 *
 * @param {Object} quote - Quote document from database
 * @returns {Object} Formatted quote data
 */
const formatQuoteForDocument = (quote) => {
  return {
    contractorInfo: {
      name: quote.contractorName,
      company: quote.company,
    },
    projectDetails: {
      roofSize: quote.roofSize,
      roofType: quote.roofType,
      location: `${quote.projectCity}, ${quote.projectState}`,
      date: new Date(quote.projectDate).toLocaleDateString(),
    },
    submissionDate: new Date(quote.createdAt).toLocaleDateString(),
    quoteId: quote._id.toString(),
  };
};
