/**
 * Quotes List Component Tests
 *
 * Test suite for the QuotesList component that displays submitted quotes.
 * Tests list rendering, filtering, pagination, and PDF download functionality.
 * Uses React Testing Library for DOM testing and Jest for assertions.
 *
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import QuotesList from "../QuotesList";
import { getQuotes, downloadQuotePDF } from "../../utils/api";

// Mock the API module
jest.mock("../../utils/api");

/**
 * Mock quote data for testing
 * @constant {Array<Object>}
 */
const mockQuotes = [
  {
    _id: "1",
    contractorName: "John Doe",
    company: "ABC Roofing",
    roofSize: 1000,
    roofType: "Metal",
    projectCity: "Phoenix",
    projectState: "AZ",
    projectDate: "2025-05-01",
  },
  {
    _id: "2",
    contractorName: "Jane Smith",
    company: "XYZ Construction",
    roofSize: 2000,
    roofType: "TPO",
    projectCity: "Los Angeles",
    projectState: "CA",
    projectDate: "2025-06-01",
  },
];

/**
 * Test suite for QuotesList component
 * Groups related tests and provides common setup/teardown
 */
describe("QuotesList", () => {
  // Reset all mock functions before each test
  beforeEach(() => {
    getQuotes.mockClear();
    downloadQuotePDF.mockClear();
  });

  /**
   * Test: Initial Loading State
   * Verifies that loading indicator appears while fetching quotes
   */
  it("renders loading state initially", () => {
    // Mock pending promise to keep component in loading state
    getQuotes.mockImplementation(() => new Promise(() => {}));
    render(<QuotesList />);
    expect(screen.getByText(/loading quotes/i)).toBeInTheDocument();
  });

  /**
   * Test: Successful Quote Loading
   * Verifies that quotes are displayed when loaded successfully
   */
  it("displays quotes when loaded successfully", async () => {
    getQuotes.mockResolvedValueOnce({ quotes: mockQuotes });

    render(<QuotesList />);

    await waitFor(() => {
      expect(screen.getByText("ABC Roofing")).toBeInTheDocument();
      expect(screen.getByText("XYZ Construction")).toBeInTheDocument();
    });
  });

  /**
   * Test: Error State
   * Verifies that error message appears when loading fails
   */
  it("shows error message when loading fails", async () => {
    getQuotes.mockRejectedValueOnce(new Error("Failed to load quotes"));

    render(<QuotesList />);

    await waitFor(() => {
      expect(screen.getByText(/error loading quotes/i)).toBeInTheDocument();
    });
  });

  /**
   * Test: State Filter
   * Verifies that filtering by state works correctly
   */
  it("filters quotes by state", async () => {
    getQuotes.mockResolvedValueOnce({ quotes: mockQuotes });

    render(<QuotesList />);

    await waitFor(() => {
      expect(screen.getByText("ABC Roofing")).toBeInTheDocument();
    });

    const stateSelect = screen.getByLabelText(/filter by state/i);
    await userEvent.selectOptions(stateSelect, "CA");

    expect(getQuotes).toHaveBeenCalledWith(
      expect.objectContaining({ state: "CA" })
    );
  });

  /**
   * Test: Roof Type Filter
   * Verifies that filtering by roof type works correctly
   */
  it("filters quotes by roof type", async () => {
    getQuotes.mockResolvedValueOnce({ quotes: mockQuotes });

    render(<QuotesList />);

    await waitFor(() => {
      expect(screen.getByText("ABC Roofing")).toBeInTheDocument();
    });

    const roofTypeSelect = screen.getByLabelText(/filter by roof type/i);
    await userEvent.selectOptions(roofTypeSelect, "TPO");

    expect(getQuotes).toHaveBeenCalledWith(
      expect.objectContaining({ roofType: "TPO" })
    );
  });

  /**
   * Test: PDF Download
   * Verifies that PDF download functionality works
   */
  it("handles PDF download", async () => {
    getQuotes.mockResolvedValueOnce({ quotes: mockQuotes });
    downloadQuotePDF.mockResolvedValueOnce({});

    render(<QuotesList />);

    await waitFor(() => {
      expect(screen.getByText("ABC Roofing")).toBeInTheDocument();
    });

    const downloadButtons = screen.getAllByText(/download pdf/i);
    fireEvent.click(downloadButtons[0]);

    expect(downloadQuotePDF).toHaveBeenCalledWith("1");
  });

  /**
   * Test: Empty State
   * Verifies that appropriate message appears when no quotes are found
   */
  it("shows no quotes message when list is empty", async () => {
    getQuotes.mockResolvedValueOnce({ quotes: [] });

    render(<QuotesList />);

    await waitFor(() => {
      expect(screen.getByText(/no quotes found/i)).toBeInTheDocument();
    });
  });

  /**
   * Test: Download Button State
   * Verifies that download button is disabled while downloading
   */
  it("disables download button while downloading", async () => {
    getQuotes.mockResolvedValueOnce({ quotes: mockQuotes });
    downloadQuotePDF.mockImplementation(() => new Promise(() => {}));

    render(<QuotesList />);

    await waitFor(() => {
      expect(screen.getByText("ABC Roofing")).toBeInTheDocument();
    });

    const downloadButton = screen.getAllByText(/download pdf/i)[0];
    fireEvent.click(downloadButton);

    expect(downloadButton).toBeDisabled();
    expect(downloadButton).toHaveTextContent(/downloading/i);
  });
});
