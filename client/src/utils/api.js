/**
 * API Service Module
 *
 * Provides a centralized interface for making HTTP requests to the backend API.
 * Uses axios for HTTP requests and includes error handling and response interceptors.
 * All API endpoints and their corresponding functions are documented here.
 */

import axios from "axios";

// Read API URL from environment variable or fallback to localhost
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:3001/api";

/**
 * Configure axios instance with default settings
 * This includes base URL, headers, and interceptors for consistent API communication
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

/**
 * Response interceptor for handling errors globally
 * Provides consistent error handling across all API calls
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract meaningful error message
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "An unexpected error occurred";

    // Log errors in development environment
    if (process.env.NODE_ENV === "development") {
      console.error("API Error:", error.response || error);
    }

    return Promise.reject(new Error(errorMessage));
  }
);

/**
 * Submit a new quote
 * @param {Object} quoteData - The quote data to submit
 * @param {string} quoteData.contractorName - Name of the contractor
 * @param {string} quoteData.company - Company name
 * @param {number} quoteData.roofSize - Size of the roof in square feet
 * @param {string} quoteData.roofType - Type of roof (Metal, TPO, Foam, Other)
 * @param {string} quoteData.projectCity - City where the project is located
 * @param {string} quoteData.projectState - Two-letter state code
 * @param {string} quoteData.projectDate - Planned date for the project
 * @returns {Promise<Object>} The created quote object
 * @throws {Error} If the API call fails
 */
export const submitQuote = async (quoteData) => {
  try {
    const response = await api.post("/quotes", quoteData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Retrieve quotes with optional filtering
 * @param {Object} filters - Optional filters for the quotes
 * @param {string} [filters.state] - Filter by state code
 * @param {string} [filters.roofType] - Filter by roof type
 * @param {number} [filters.page] - Page number for pagination
 * @param {number} [filters.limit] - Number of items per page
 * @returns {Promise<Object>} Object containing quotes and pagination info
 * @throws {Error} If the API call fails
 */
export const getQuotes = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.state) params.append("state", filters.state);
    if (filters.roofType) params.append("roofType", filters.roofType);
    if (filters.page) params.append("page", filters.page);
    if (filters.limit) params.append("limit", filters.limit);

    const response = await api.get(`/quotes?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Download a quote as PDF
 * @param {string} quoteId - ID of the quote to download
 * @returns {Promise<Blob>} PDF file as a blob
 * @throws {Error} If the API call fails
 */
export const downloadQuotePDF = async (quoteId) => {
  try {
    const response = await api.get(`/quotes/${quoteId}/pdf`, {
      responseType: "blob",
    });

    // Create and trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `quote-${quoteId}.pdf`);
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Export quotes as CSV
 * @param {Object} filters - Optional filters for the export
 * @param {string} [filters.state] - Filter by state code
 * @param {string} [filters.roofType] - Filter by roof type
 * @returns {Promise<void>} Triggers CSV download
 * @throws {Error} If the API call fails
 */
export const exportQuotesCSV = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.state) params.append("state", filters.state);
    if (filters.roofType) params.append("roofType", filters.roofType);

    const response = await api.get(`/quotes/export/csv?${params.toString()}`, {
      responseType: "blob",
    });

    // Create and trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `quotes-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    throw error;
  }
};
