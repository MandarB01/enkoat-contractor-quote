const errorHandler = require("../errorHandler");
const AppError = require("../../utils/AppError");
const logger = require("../../utils/loggerUtil");

jest.mock("../../utils/loggerUtil", () => ({
  error: jest.fn(),
  info: jest.fn(),
}));

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.headersSent = false;
  return res;
};

describe("Error Handler Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = "test";
    req = { originalUrl: "/test", method: "GET", ip: "127.0.0.1" };
    res = mockResponse();
    next = jest.fn();
  });

  it("should log the error details", () => {
    const err = new Error("Generic Test Error");
    err.statusCode = 500;
    errorHandler(err, req, res, next);
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining(
        "500 - Generic Test Error - /test - GET - 127.0.0.1"
      ),
      err.stack
    );
  });

  it("should handle AppError instances correctly (production mode)", () => {
    const err = new AppError("Resource not found", 404);
    errorHandler(err, req, res, next);

    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining(
        "404 - Resource not found - /test - GET - 127.0.0.1"
      ),
      err.stack
    );
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: "fail",
      message: "Resource not found",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should handle generic Errors with 500 status (production mode)", () => {
    const err = new Error("Something broke");
    errorHandler(err, req, res, next);

    // Check the primary log call
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining(
        "500 - Something broke - /test - GET - 127.0.0.1"
      ),
      err.stack
    );
    // Check the secondary log call inside sendErrorProd for non-operational errors
    // It receives the error object passed to sendErrorProd, which is a copy
    expect(logger.error).toHaveBeenCalledWith(
      "ERROR 💥",
      expect.objectContaining({ message: "Something broke" })
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "Something went wrong!",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should include stack trace in development environment", () => {
    process.env.NODE_ENV = "development";
    const err = new Error("Dev error");
    err.stack = "Error stack trace";
    errorHandler(err, req, res, next);

    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining("500 - Dev error - /test - GET - 127.0.0.1"),
      err.stack
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      error: err,
      message: "Dev error",
      stack: "Error stack trace",
    });
  });

  it("should handle Mongoose validation errors (ValidationError)", () => {
    const err = new Error("Validation failed: name: Path `name` is required.");
    err.name = "ValidationError";
    err.errors = { name: { message: "Path `name` is required." } };
    errorHandler(err, req, res, next);

    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining(
        "500 - Validation failed: name: Path `name` is required."
      ),
      err.stack
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "fail",
      message: "Invalid input data. Path `name` is required.",
    });
  });

  it("should handle Mongoose duplicate key errors (code 11000)", () => {
    const err = new Error(
      'E11000 duplicate key error collection: test.quotes index: email_1 dup key: { email: "test@example.com" }'
    );
    err.code = 11000;
    err.keyValue = { email: "test@example.com" };
    err.errmsg =
      'E11000 duplicate key error collection: test.quotes index: email_1 dup key: { email: "test@example.com" }';
    errorHandler(err, req, res, next);

    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining("500 - E11000 duplicate key error"),
      err.stack
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "fail",
      message:
        'Duplicate field value: "test@example.com". Please use another value!',
    });
  });

  it("should handle Mongoose CastError (invalid ID format)", () => {
    const err = new Error(
      'Cast to ObjectId failed for value "invalidId" at path "_id"'
    );
    err.name = "CastError";
    err.path = "_id";
    err.value = "invalidId";
    errorHandler(err, req, res, next);

    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining("500 - Cast to ObjectId failed"),
      err.stack
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "fail",
      message: "Invalid _id: invalidId",
    });
  });

  it("should not send response if headers already sent", () => {
    const err = new Error("Late error");
    res.headersSent = true;
    errorHandler(err, req, res, next);

    // Logging should NOT happen because the function returns early
    expect(logger.error).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
    // Should call next to let default Express handler deal with it
    expect(next).toHaveBeenCalledWith(err);
  });
});
