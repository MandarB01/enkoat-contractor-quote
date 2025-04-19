/**
 * Quote Form Component Tests
 *
 * Test suite for the QuoteForm component that handles quote submissions.
 * Tests form rendering, validation, submission, and error handling.
 * Uses React Testing Library for DOM testing and Jest for assertions.
 *
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import QuoteForm from "../QuoteForm";
import { submitQuote } from "../../utils/api";

// Mock the API module
jest.mock("../../utils/api");

/**
 * Test suite for QuoteForm component
 * Groups related tests and provides common setup/teardown
 */
describe("QuoteForm", () => {
  // Reset mock function state before each test
  beforeEach(() => {
    submitQuote.mockClear();
  });

  /**
   * Test: Form Field Rendering
   * Verifies that all required form fields are present in the DOM
   */
  it("renders all form fields", () => {
    render(<QuoteForm />);

    // Check for presence of all required form fields
    expect(screen.getByLabelText(/contractor name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/company/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/roof size/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/roof type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/project city/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/project state/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/project date/i)).toBeInTheDocument();
  });

  /**
   * Test: Form Validation
   * Checks that validation errors appear for empty required fields
   */
  it("shows validation errors for empty required fields", async () => {
    render(<QuoteForm />);

    // Trigger form submission without filling any fields
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    // Assert that validation error messages appear
    await waitFor(() => {
      expect(
        screen.getByText(/contractor name is required/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/company.*required/i)).toBeInTheDocument();
      expect(screen.getByText(/roof size.*required/i)).toBeInTheDocument();
    });
  });

  /**
   * Test: Successful Form Submission
   * Verifies that form submission works with valid data
   */
  it("successfully submits form with valid data", async () => {
    // Mock data for form submission
    const mockQuote = {
      contractorName: "John Doe",
      company: "ABC Roofing",
      roofSize: 1000,
      roofType: "Metal",
      projectCity: "Phoenix",
      projectState: "AZ",
      projectDate: "2025-05-01",
    };

    // Mock successful API response
    submitQuote.mockResolvedValueOnce({
      message: "Quote submitted successfully",
    });

    render(<QuoteForm />);

    // Fill out form fields
    await userEvent.type(
      screen.getByLabelText(/contractor name/i),
      mockQuote.contractorName
    );
    await userEvent.type(screen.getByLabelText(/company/i), mockQuote.company);
    await userEvent.type(
      screen.getByLabelText(/roof size/i),
      mockQuote.roofSize.toString()
    );
    await userEvent.selectOptions(
      screen.getByLabelText(/roof type/i),
      mockQuote.roofType
    );
    await userEvent.type(
      screen.getByLabelText(/project city/i),
      mockQuote.projectCity
    );
    await userEvent.type(
      screen.getByLabelText(/project state/i),
      mockQuote.projectState
    );
    await userEvent.type(
      screen.getByLabelText(/project date/i),
      mockQuote.projectDate
    );

    // Submit form
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    // Verify submission
    await waitFor(() => {
      expect(submitQuote).toHaveBeenCalledWith(mockQuote);
      expect(
        screen.getByText(/quote submitted successfully/i)
      ).toBeInTheDocument();
    });
  });

  /**
   * Test: Failed Form Submission
   * Verifies that error messages appear when submission fails
   */
  it("shows error message when submission fails", async () => {
    submitQuote.mockRejectedValueOnce(new Error("Submission failed"));

    render(<QuoteForm />);

    // Fill out form with valid data
    await userEvent.type(screen.getByLabelText(/contractor name/i), "John Doe");
    await userEvent.type(screen.getByLabelText(/company/i), "ABC Roofing");
    await userEvent.type(screen.getByLabelText(/roof size/i), "1000");
    await userEvent.selectOptions(screen.getByLabelText(/roof type/i), "Metal");
    await userEvent.type(screen.getByLabelText(/project city/i), "Phoenix");
    await userEvent.type(screen.getByLabelText(/project state/i), "AZ");
    await userEvent.type(screen.getByLabelText(/project date/i), "2025-05-01");

    // Submit form
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    // Verify error message appears
    await waitFor(() => {
      expect(screen.getByText(/submission failed/i)).toBeInTheDocument();
    });
  });
});
