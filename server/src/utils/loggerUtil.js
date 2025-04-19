// Simple logger utility
// Using console for simplicity, could be replaced with a more robust logger like Winston

const error = (...args) => {
  // Allow logging during tests to verify calls
  console.error(...args);
};

const info = (...args) => {
  // Allow logging during tests
  console.log(...args);
};

// Add other levels like warn, debug if needed

module.exports = {
  error,
  info,
};
