import React from "react";
import { Link } from "react-router-dom";
import "./Navigation.css";
import logo from "../assets/enkoat-logo-updated-new.png";

const Navigation = () => {
  return (
    <nav>
      <div className="nav-container">
        <div className="logo">
          <img src={logo} alt="EnKoat Logo" />
        </div>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/quotes">View Quotes</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
