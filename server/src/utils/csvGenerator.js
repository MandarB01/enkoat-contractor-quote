// filepath: /Users/mandarburande/Projects/EnKoat/enkoat-contractor-quote/contractor-quote-portal/server/src/utils/csvGenerator.js
// Placeholder for CSV generation logic
// You could use a library like 'csv-stringify' or build the string manually

const generateQuotesCSV = async (quotesData) => {
  console.log(`Generating CSV for ${quotesData.length} quotes.`);

  if (!quotesData || quotesData.length === 0) {
    // Return only headers if no data
    return "Contractor Name,Company,Roof Size (sq ft),Roof Type,Project City,Project State,Project Date\n";
  }

  // Define headers
  const headers = [
    "Contractor Name",
    "Company",
    "Roof Size (sq ft)",
    "Roof Type",
    "Project City",
    "Project State",
    "Project Date",
  ];

  // Function to safely format CSV fields (handles commas, quotes)
  const formatField = (field) => {
    if (field === null || typeof field === "undefined") {
      return "";
    }
    const stringField = String(field);
    // Escape double quotes by doubling them and enclose in double quotes if it contains comma, newline or double quote
    if (
      stringField.includes(",") ||
      stringField.includes("\n") ||
      stringField.includes('"')
    ) {
      return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
  };

  // Map data to CSV rows
  const rows = quotesData.map((quote) =>
    [
      formatField(quote.contractorName),
      formatField(quote.company),
      formatField(quote.roofSize),
      formatField(quote.roofType),
      formatField(quote.projectCity),
      formatField(quote.projectState),
      // Format date to YYYY-MM-DD or desired format
      formatField(
        quote.projectDate
          ? new Date(quote.projectDate).toISOString().split("T")[0]
          : ""
      ),
    ].join(",")
  );

  // Combine headers and rows
  const csvString = [headers.join(","), ...rows].join("\n");

  return csvString;
};

module.exports = {
  generateQuotesCSV,
};
