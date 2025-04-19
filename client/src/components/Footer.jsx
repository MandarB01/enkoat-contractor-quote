import React from "react";
import "./Footer.css";
import footerLogo from "../assets/enkoat-logo-updated-new.png";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-logo">
          <img src={footerLogo} alt="EnKoat Logo" />
        </div>
        <div className="footer-text">
          <p>
            &copy; {new Date().getFullYear()} Contractor Quote Submission
            Portal. All rights reserved.
          </p>
          <p>
            Contact us:{" "}
            <a href="mailto:support@contractorquote.com">
              support@contractorquote.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
