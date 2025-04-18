// filepath: /Users/mandarburande/Projects/EnKoat/enkoat-contractor-quote/contractor-quote-portal/server/src/controllers/__tests__/quoteController.test.js
const quoteController = require("../quoteController");
const Quote = require("../../models/Quote");
const AppError = require("../../utils/AppError");
const { validationResult } = require("express-validator");
const pdfGenerator = require("../../utils/pdfGenerator"); // Assuming you'll create this
const csvGenerator = require("../../utils/csvGenerator"); // Assuming you'll create this

// Mock dependencies
jest.mock("../../models/Quote");
jest.mock("express-validator", () => ({
  validationResult: jest.fn(),
  // Add mock for the 'body' function
  body: jest.fn(() => ({
    trim: jest.fn().mockReturnThis(),
    isLength: jest.fn().mockReturnThis(),
    matches: jest.fn().mockReturnThis(),
    withMessage: jest.fn().mockReturnThis(),
    escape: jest.fn().mockReturnThis(),
    isNumeric: jest.fn().mockReturnThis(),
    isFloat: jest.fn().mockReturnThis(),
    isIn: jest.fn().mockReturnThis(),
    isUppercase: jest.fn().mockReturnThis(),
    isDate: jest.fn().mockReturnThis(),
    custom: jest.fn().mockReturnThis(),
  })),
}));
jest.mock("../../utils/pdfGenerator"); // Mock the PDF generator utility
jest.mock("../../utils/csvGenerator"); // Mock the CSV generator utility

// Mock request and response objects
const mockRequest = (body = {}, query = {}, params = {}) => ({
  body,
  query,
  params,
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

describe("Quote Controller", () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    validationResult.mockReturnValue({ isEmpty: () => true, array: () => [] }); // Default to no validation errors
  });

  // --- Test createQuote ---
  describe("createQuote", () => {
    it("should create a quote and return 201 on success", async () => {
      const req = mockRequest({
        contractorName: "Test" /* other valid fields */,
      });
      const res = mockResponse();
      const mockSavedQuote = { _id: "123", ...req.body };

      Quote.prototype.save = jest.fn().mockResolvedValue(mockSavedQuote);

      await quoteController.createQuote(req, res, mockNext);

      expect(Quote.prototype.save).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Quote submitted successfully",
        quote: mockSavedQuote,
      });
    });

    it("should call next with error if saving fails", async () => {
      const req = mockRequest({ contractorName: "Test" });
      const res = mockResponse();
      const error = new Error("Database error");
      Quote.prototype.save = jest.fn().mockRejectedValue(error);

      await quoteController.createQuote(req, res, mockNext);

      expect(Quote.prototype.save).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it("should return 400 if validation fails", async () => {
      const req = mockRequest({}); // Invalid data
      const res = mockResponse();
      const validationErrors = [{ msg: "Contractor name required" }];
      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => validationErrors,
      });

      await quoteController.createQuote(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ errors: validationErrors });
      expect(Quote.prototype.save).not.toHaveBeenCalled();
    });
  });

  // --- Test getQuotes ---
  describe("getQuotes", () => {
    it("should return quotes based on filters", async () => {
      const req = mockRequest({}, { state: "CA", roofType: "Metal" });
      const res = mockResponse();
      const mockQuotes = [
        { _id: "1", state: "CA" },
        { _id: "2", state: "CA" },
      ];

      Quote.find = jest.fn().mockResolvedValue(mockQuotes);

      await quoteController.getQuotes(req, res, mockNext);

      expect(Quote.find).toHaveBeenCalledWith({
        projectState: "CA",
        roofType: "Metal",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockQuotes);
    });

    it("should return all quotes if no filters provided", async () => {
      const req = mockRequest({}, {});
      const res = mockResponse();
      const mockQuotes = [{ _id: "1" }, { _id: "2" }];

      Quote.find = jest.fn().mockResolvedValue(mockQuotes);

      await quoteController.getQuotes(req, res, mockNext);

      expect(Quote.find).toHaveBeenCalledWith({}); // Empty filter object
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockQuotes);
    });

    it("should call next with error if fetching fails", async () => {
      const req = mockRequest();
      const res = mockResponse();
      const error = new Error("Database error");
      Quote.find = jest.fn().mockRejectedValue(error);

      await quoteController.getQuotes(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // --- Test downloadQuotePDF ---
  describe("downloadQuotePDF", () => {
    it("should generate and send PDF for a valid quote ID", async () => {
      const quoteId = "validId123";
      const req = mockRequest({}, {}, { id: quoteId });
      const res = mockResponse();
      const mockQuote = { _id: quoteId, contractorName: "PDF Test" };
      const mockPdfBuffer = Buffer.from("mock pdf content");

      Quote.findById = jest.fn().mockResolvedValue(mockQuote);
      pdfGenerator.generateQuotePDF = jest
        .fn()
        .mockResolvedValue(mockPdfBuffer); // Mock the generator

      await quoteController.downloadQuotePDF(req, res, mockNext);

      expect(Quote.findById).toHaveBeenCalledWith(quoteId);
      expect(pdfGenerator.generateQuotePDF).toHaveBeenCalledWith(mockQuote);
      expect(res.setHeader).toHaveBeenCalledWith(
        "Content-Type",
        "application/pdf"
      );
      expect(res.setHeader).toHaveBeenCalledWith(
        "Content-Disposition",
        `attachment; filename="quote_${quoteId}.pdf"`
      );
      expect(res.send).toHaveBeenCalledWith(mockPdfBuffer);
    });

    it("should call next with 404 AppError if quote not found", async () => {
      const quoteId = "notFoundId";
      const req = mockRequest({}, {}, { id: quoteId });
      const res = mockResponse();

      Quote.findById = jest.fn().mockResolvedValue(null); // Quote not found

      await quoteController.downloadQuotePDF(req, res, mockNext);

      expect(Quote.findById).toHaveBeenCalledWith(quoteId);
      expect(pdfGenerator.generateQuotePDF).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect(mockNext.mock.calls[0][0].statusCode).toBe(404);
      expect(mockNext.mock.calls[0][0].message).toBe("Quote not found");
    });

    it("should call next with error if PDF generation fails", async () => {
      const quoteId = "validId123";
      const req = mockRequest({}, {}, { id: quoteId });
      const res = mockResponse();
      const mockQuote = { _id: quoteId, contractorName: "PDF Test" };
      const error = new Error("PDF generation failed");

      Quote.findById = jest.fn().mockResolvedValue(mockQuote);
      pdfGenerator.generateQuotePDF = jest.fn().mockRejectedValue(error); // Mock failure

      await quoteController.downloadQuotePDF(req, res, mockNext);

      expect(Quote.findById).toHaveBeenCalledWith(quoteId);
      expect(pdfGenerator.generateQuotePDF).toHaveBeenCalledWith(mockQuote);
      expect(mockNext).toHaveBeenCalledWith(error);
    });

    // Add test for invalid ID format if validation is done in controller/middleware
  });

  // --- Test exportQuotesCSV ---
  describe("exportQuotesCSV", () => {
    it("should fetch quotes based on filters and generate CSV", async () => {
      const req = mockRequest({}, { state: "TX" }); // Filter by state
      const res = mockResponse();
      const mockQuotes = [
        { _id: "1", state: "TX" },
        { _id: "2", state: "TX" },
      ];
      const mockCsvData = "col1,col2\nval1,val2";

      Quote.find = jest.fn().mockResolvedValue(mockQuotes);
      csvGenerator.generateQuotesCSV = jest.fn().mockResolvedValue(mockCsvData); // Mock CSV generator

      await quoteController.exportQuotesCSV(req, res, mockNext);

      expect(Quote.find).toHaveBeenCalledWith({ projectState: "TX" });
      expect(csvGenerator.generateQuotesCSV).toHaveBeenCalledWith(mockQuotes);
      expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "text/csv");
      expect(res.setHeader).toHaveBeenCalledWith(
        "Content-Disposition",
        expect.stringContaining('attachment; filename="quotes_export_')
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(mockCsvData);
    });

    it("should return 500 status if fetching quotes fails", async () => {
      const req = mockRequest();
      const res = mockResponse();
      const error = new Error("Database error");
      Quote.find = jest.fn().mockRejectedValue(error);

      await quoteController.exportQuotesCSV(req, res, mockNext);

      expect(Quote.find).toHaveBeenCalledWith({});
      expect(csvGenerator.generateQuotesCSV).not.toHaveBeenCalled();
      // Expect a 500 status response, not next(error)
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error generating CSV",
        error: error.message,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 500 status if CSV generation fails", async () => {
      const req = mockRequest();
      const res = mockResponse();
      const mockQuotes = [{ _id: "1" }];
      const error = new Error("CSV generation failed");

      Quote.find = jest.fn().mockResolvedValue(mockQuotes);
      csvGenerator.generateQuotesCSV = jest.fn().mockRejectedValue(error); // Mock failure

      await quoteController.exportQuotesCSV(req, res, mockNext);

      expect(Quote.find).toHaveBeenCalledWith({});
      expect(csvGenerator.generateQuotesCSV).toHaveBeenCalledWith(mockQuotes);
      // Expect a 500 status response, not next(error)
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error generating CSV",
        error: error.message,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
