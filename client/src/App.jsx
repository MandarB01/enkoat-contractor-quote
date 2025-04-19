/**
 * Root Application Component
 *
 * This is the main component of the Contractor Quote Portal application.
 * It sets up routing and the basic application structure including
 * navigation and footer components.
 *
 * The application uses React Router for navigation between different views:
 * - Home/Submit Quote (/)
 * - Submit Quote (/submit-quote)
 * - View Quotes (/quotes)
 */

import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import QuoteForm from "./components/QuoteForm";
import QuotesList from "./components/QuotesList";
import "./styles/main.css";
import favicon from "./assets/favicon-new-150x150.png";

/**
 * App Component
 *
 * Provides the main application structure and routing configuration.
 * Uses React Router for client-side routing and includes persistent
 * navigation and footer components.
 *
 * @component
 * @returns {JSX.Element} The rendered application
 */
function App() {
  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']");
    if (link) {
      link.href = favicon;
    }
  }, []);

  return (
    <Router>
      <div className="app">
        {/* Main Navigation */}
        <Navigation />

        {/* Main Content Area */}
        <main className="container">
          <Routes>
            {/* Home Route - Shows Quote Form */}
            <Route path="/" element={<QuoteForm />} />

            {/* Quote Listing Route */}
            <Route path="/quotes" element={<QuotesList />} />
          </Routes>
        </main>

        {/* Persistent Footer */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
