// filepath: /Users/mandarburande/Projects/EnKoat/enkoat-contractor-quote/contractor-quote-portal/server/src/__tests__/api.test.js
const request = require("supertest");
const app = require("../app"); // Assuming your Express app instance is exported from app.js
const mongoose = require("mongoose");
const Quote = require("../models/Quote"); // Adjust path if needed
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

// Setup MongoDB Memory Server before all tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  // Ensure mongoose connects before running tests
  await mongoose.connect(mongoUri, {
    // useNewUrlParser: true, // Deprecated
    // useUnifiedTopology: true, // Deprecated
  });
});

// Clean up database after each test
afterEach(async () => {
  await Quote.deleteMany({});
});

// Disconnect Mongoose and stop MongoDB Memory Server after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("API Endpoints", () => {
  // Test Health Check endpoint
  describe("GET /api/health", () => {
    it("should return 200 OK and status message", async () => {
      const res = await request(app).get("/api/health");
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status", "UP");
      expect(res.body).toHaveProperty("timestamp");
    });
  });

  // Test Quote Submission endpoint
  describe("POST /api/quotes", () => {
    const validQuoteData = {
      contractorName: "Test Contractor",
      company: "Test Company Inc.",
      roofSize: 1500,
      roofType: "Asphalt",
      projectCity: "Testville",
      projectState: "TX",
      projectDate: "2025-06-15", // Use a future date relative to test run
    };

    beforeAll(() => {
      // Adjust date dynamically to be in the future
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30); // 30 days in the future
      validQuoteData.projectDate = futureDate.toISOString().split("T")[0];
    });

    it("should create a new quote with valid data and return 201", async () => {
      const res = await request(app).post("/api/quotes").send(validQuoteData);
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty(
        "message",
        "Quote submitted successfully"
      );
      expect(res.body).toHaveProperty("quote");
      // Check a few key fields, avoid matching _id or dates directly if they change
      expect(res.body.quote.contractorName).toBe(validQuoteData.contractorName);
      expect(res.body.quote.company).toBe(validQuoteData.company);
      expect(res.body.quote.roofSize).toBe(validQuoteData.roofSize);
      expect(res.body.quote.roofType).toBe(validQuoteData.roofType);
      expect(res.body.quote.projectCity).toBe(validQuoteData.projectCity);
      expect(res.body.quote.projectState).toBe(validQuoteData.projectState);
      // Optionally check date format or approximate value
      expect(res.body.quote.projectDate).toContain(validQuoteData.projectDate);

      // Verify data in DB
      const quoteInDb = await Quote.findById(res.body.quote._id);
      expect(quoteInDb).not.toBeNull();
      expect(quoteInDb.contractorName).toBe(validQuoteData.contractorName);
    });

    it("should return 400 Bad Request for missing required fields", async () => {
      const invalidData = { ...validQuoteData, contractorName: "" }; // Missing contractorName
      const res = await request(app).post("/api/quotes").send(invalidData);
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("errors");
      expect(res.body.errors[0].msg).toContain("Contractor name is required");
    });

    it("should return 400 Bad Request for invalid state code", async () => {
      const invalidData = { ...validQuoteData, projectState: "XYZ" }; // Invalid state
      const res = await request(app).post("/api/quotes").send(invalidData);
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("errors");
      expect(res.body.errors[0].msg).toContain("Invalid state code");
    });

    it("should return 400 Bad Request for past project date", async () => {
      const invalidData = { ...validQuoteData, projectDate: "2020-01-01" }; // Past date
      const res = await request(app).post("/api/quotes").send(invalidData);
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("errors");
      expect(res.body.errors[0].msg).toContain(
        "Project date cannot be in the past"
      );
    });

    // Add more validation tests (invalid roof size, date format etc.)
  });

  // Test Get Quotes endpoint
  describe("GET /api/quotes", () => {
    beforeEach(async () => {
      // Seed some data
      const date1 = new Date();
      date1.setDate(date1.getDate() + 10);
      const date2 = new Date();
      date2.setDate(date2.getDate() + 20);
      const date3 = new Date();
      date3.setDate(date3.getDate() + 30);
      await Quote.insertMany([
        {
          contractorName: "Contractor A",
          company: "Comp A",
          roofSize: 1000,
          roofType: "Metal",
          projectCity: "City A",
          projectState: "CA",
          projectDate: date1,
        },
        {
          contractorName: "Contractor B",
          company: "Comp B",
          roofSize: 2000,
          roofType: "Tile",
          projectCity: "City B",
          projectState: "AZ",
          projectDate: date2,
        },
        {
          contractorName: "Contractor C",
          company: "Comp C",
          roofSize: 1500,
          roofType: "Metal",
          projectCity: "City C",
          projectState: "CA",
          projectDate: date3,
        },
      ]);
    });

    it("should return all quotes and 200 OK", async () => {
      const res = await request(app).get("/api/quotes");
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBe(3);
    });

    it("should filter quotes by state", async () => {
      const res = await request(app).get("/api/quotes?state=CA");
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0].projectState).toBe("CA");
      expect(res.body[1].projectState).toBe("CA");
    });

    it("should filter quotes by roof type", async () => {
      const res = await request(app).get("/api/quotes?roofType=Metal");
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0].roofType).toBe("Metal");
      expect(res.body[1].roofType).toBe("Metal");
    });

    it("should filter quotes by state and roof type", async () => {
      const res = await request(app).get("/api/quotes?state=CA&roofType=Metal");
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBe(2); // Both CA quotes are Metal in this seed data
      res.body.forEach((quote) => {
        expect(quote.projectState).toBe("CA");
        expect(quote.roofType).toBe("Metal");
      });
    });

    it("should return empty array if no quotes match filters", async () => {
      const res = await request(app).get("/api/quotes?state=NY");
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBe(0);
    });
  });

  // Test PDF Download endpoint
  describe("GET /api/quotes/:id/pdf", () => {
    let testQuote;
    beforeEach(async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 40);
      testQuote = await Quote.create({
        contractorName: "PDF Test",
        company: "PDF Comp",
        roofSize: 500,
        roofType: "Flat",
        projectCity: "PDF City",
        projectState: "FL",
        projectDate: futureDate,
      });
    });

    it("should return 200 OK and a PDF file for a valid quote ID", async () => {
      // Mock the actual PDF generation if it's complex or uses external libs
      // For now, assume controller handles it or calls a utility
      const res = await request(app).get(`/api/quotes/${testQuote._id}/pdf`);
      expect(res.statusCode).toEqual(200);
      expect(res.headers["content-type"]).toEqual("application/pdf");
      expect(res.headers["content-disposition"]).toContain(
        `attachment; filename="quote_${testQuote._id}.pdf"`
      );
      // We can't easily verify PDF content here, but check headers and status
      expect(res.body).toBeInstanceOf(Buffer); // Response body should be a buffer
    });

    it("should return 404 Not Found for a non-existent quote ID", async () => {
      const invalidId = new mongoose.Types.ObjectId(); // Generate a valid but non-existent ID
      const res = await request(app).get(`/api/quotes/${invalidId}/pdf`);
      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty("message", "Quote not found");
    });

    it("should return 400 Bad Request for a malformed quote ID", async () => {
      const res = await request(app).get("/api/quotes/invalid-id-format/pdf");
      expect(res.statusCode).toEqual(400);
      // The exact error message might depend on your ObjectId validation middleware/logic
      expect(res.body).toHaveProperty("message", "Invalid Quote ID format");
    });
  });

  // Test CSV Export endpoint
  describe("GET /api/quotes/export/csv", () => {
    beforeEach(async () => {
      // Seed data for CSV export
      const date1 = new Date();
      date1.setDate(date1.getDate() + 10);
      const date2 = new Date();
      date2.setDate(date2.getDate() + 20);
      await Quote.insertMany([
        {
          contractorName: "CSV A",
          company: "Comp A",
          roofSize: 1100,
          roofType: "Metal",
          projectCity: "City A",
          projectState: "CA",
          projectDate: date1,
        },
        {
          contractorName: "CSV B",
          company: "Comp B",
          roofSize: 2100,
          roofType: "TPO",
          projectCity: "City B",
          projectState: "AZ",
          projectDate: date2,
        },
      ]);
    });

    it("should return 200 OK and CSV data for all quotes", async () => {
      const res = await request(app).get("/api/quotes/export/csv");
      expect(res.statusCode).toEqual(200);
      expect(res.headers["content-type"]).toEqual("text/csv");
      expect(res.headers["content-disposition"]).toContain(
        'attachment; filename="quotes_export_'
      );
      expect(res.text).toContain(
        "Contractor Name,Company,Roof Size (sq ft),Roof Type,Project City,Project State,Project Date"
      ); // Check header row
      expect(res.text).toContain("CSV A,Comp A,1100,Metal,City A,CA");
      expect(res.text).toContain("CSV B,Comp B,2100,TPO,City B,AZ");
    });

    it("should return 200 OK and filtered CSV data", async () => {
      const res = await request(app).get("/api/quotes/export/csv?state=AZ");
      expect(res.statusCode).toEqual(200);
      expect(res.headers["content-type"]).toEqual("text/csv");
      expect(res.text).toContain(
        "Contractor Name,Company,Roof Size (sq ft),Roof Type,Project City,Project State,Project Date"
      );
      expect(res.text).not.toContain("CSV A,Comp A");
      expect(res.text).toContain("CSV B,Comp B,2100,TPO,City B,AZ");
    });

    it("should return 200 OK and empty CSV (headers only) if no quotes match filter", async () => {
      const res = await request(app).get("/api/quotes/export/csv?state=NY");
      expect(res.statusCode).toEqual(200);
      expect(res.headers["content-type"]).toEqual("text/csv");
      expect(res.text).toContain(
        "Contractor Name,Company,Roof Size (sq ft),Roof Type,Project City,Project State,Project Date"
      );
      expect(res.text.split("\n").length).toBe(2); // Header row + one empty line usually
    });
  });
});
