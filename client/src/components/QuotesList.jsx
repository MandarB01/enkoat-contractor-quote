import React, { useState, useEffect, useCallback } from "react";
import { getQuotes } from "../utils/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./QuotesList.css";

const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

const QuotesList = () => {
  const [quotes, setQuotes] = useState([]);
  const [filters, setFilters] = useState({
    state: "",
    roofType: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

  const fetchQuotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getQuotes(filters);
      setQuotes(data.quotes || []);
    } catch (err) {
      setError(err.message || "Error loading quotes. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      state: "",
      roofType: "",
    });
  };

  const handleDownloadPDF = async (quote) => {
    try {
      setDownloading(true);
      setDownloadError(null);

      // Initialize jsPDF
      const doc = new jsPDF("landscape", "mm", "a4");

      // Add autoTable to the document
      autoTable(doc, {
        head: [["Field", "Details"]],
        body: [
          ["Company", quote.company],
          ["Contractor Name", quote.contractorName],
          ["Roof Size", `${quote.roofSize} sq ft`],
          ["Roof Type", quote.roofType],
          ["Project Location", `${quote.projectCity}, ${quote.projectState}`],
          ["Project Date", new Date(quote.projectDate).toLocaleDateString()],
        ],
        startY: 35,
        theme: "grid",
        styles: {
          fontSize: 10,
          cellPadding: 3,
          overflow: "linebreak",
        },
        headStyles: {
          fillColor: [231, 76, 60],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 120 },
        },
        margin: { top: 35 },
      });

      // Set document properties
      doc.setProperties({
        title: "Contractor Quote Details",
        subject: "Quote Information",
        author: "EnKoat Quote Portal",
        creator: "EnKoat Quote Portal",
      });

      // Add title and date
      doc.setFontSize(16);
      doc.text("Contractor Quote Details", 14, 15);

      doc.setFontSize(11);
      const dateStr = new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      doc.text(`Generated on: ${dateStr}`, 14, 25);

      // Save the PDF
      doc.save(`quote-details-${quote._id}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
      setDownloadError(
        err.message || "Error generating PDF. Please try again later."
      );
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner" />
        <p>Loading quotes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-display">
        <p>{error}</p>
        <button onClick={fetchQuotes} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="quotes-list">
      <h2>Submitted Quotes</h2>

      <div className="filters">
        <div className="filter-group">
          <label htmlFor="state">Filter by State</label>
          <select
            id="state"
            name="state"
            value={filters.state}
            onChange={handleFilterChange}
          >
            <option value="">All States</option>
            {US_STATES.map((state) => (
              <option key={state.code} value={state.code}>
                {state.name} ({state.code})
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="roofType">Filter by Roof Type</label>
          <select
            id="roofType"
            name="roofType"
            value={filters.roofType}
            onChange={handleFilterChange}
          >
            <option value="">All Roof Types</option>
            <option value="Metal">Metal</option>
            <option value="TPO">TPO</option>
            <option value="Foam">Foam</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <button
          onClick={handleClearFilters}
          className="clear-filters-btn"
          disabled={!filters.state && !filters.roofType}
        >
          Clear Filters
        </button>
      </div>

      {downloadError && <div className="error-message">{downloadError}</div>}

      {quotes.length === 0 ? (
        <div className="no-quotes">No quotes found matching your criteria.</div>
      ) : (
        <div className="quotes-grid">
          {quotes.map((quote) => (
            <div key={quote._id} className="quote-card">
              <h3>{quote.company}</h3>
              <p>
                <strong>Contractor:</strong> {quote.contractorName}
              </p>
              <p>
                <strong>Roof Size:</strong> {quote.roofSize} sq ft
              </p>
              <p>
                <strong>Roof Type:</strong> {quote.roofType}
              </p>
              <p>
                <strong>Location:</strong> {quote.projectCity},{" "}
                {quote.projectState}
              </p>
              <p>
                <strong>Project Date:</strong>{" "}
                {new Date(quote.projectDate).toLocaleDateString()}
              </p>
              <button
                className="download-btn"
                onClick={() => handleDownloadPDF(quote)}
                disabled={downloading}
              >
                {downloading ? "Downloading..." : "Download PDF"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuotesList;
