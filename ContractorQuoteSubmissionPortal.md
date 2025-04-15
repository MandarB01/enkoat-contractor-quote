<!-- ContractorQuoteSubmissionPortal.md -->
# Contractor Quote Submission Portal Design Document

## Table of Contents
1. [Overview](#overview)
2. [Project Goals & Scope](#project-goals--scope)
3. [Technology Stack](#technology-stack)
4. [Architecture & Component Diagram](#architecture--component-diagram)
5. [Front-End Design](#front-end-design)
6. [Back-End API Design](#back-end-api-design)
7. [Database Schema](#database-schema)
8. [UI/UX & Styling](#uiux--styling)
9. [Error Handling, Logging & Security](#error-handling-logging--security)
10. [Testing & Deployment](#testing--deployment)
11. [Coding Guidelines & Next Steps](#coding-guidelines--next-steps)

---

## Overview
The Contractor Quote Submission Portal is a full-stack application designed to capture roofing project quotes from contractors. It features a responsive, validated form for quote submissions and an API to store and retrieve these submissions. The solution uses a live backend with a MongoDB database.

## Project Goals & Scope
- **Capture Quote Data:** Allow contractors to submit their company details, roof specifications, and project details.
- **Data Retrieval:** Enable retrieval of submissions via query parameters (e.g., by state or roof type).
- **Responsive & Accessible UI:** Create an intuitive interface that works seamlessly on desktops, tablets, and mobiles.
- **Best Practices:** Follow best coding practices, proper error handling, and maintainable code structure throughout.

## Technology Stack
- **Front-End:**
  - React
  - Formik (for form state and validation)
  - Axios (for API calls)
  - Pure CSS (with detailed comments for clarity)

- **Back-End:**
  - Node.js with Express
  - MongoDB as the database

- **Bonus & Utility Libraries:**
  - PDF/CSV export: e.g., jsPDF and a CSV export library
  - CORS, Logging (using middleware like Morgan)

## Architecture & Component Diagram

**Architecture Overview:**

Client (React App) ↔ REST API (Express) ↔ MongoDB


**Component Diagram (Textual):**

  [User Interface]
       │
       ▼
  [React Components] –– (Formik forms, Axios API calls)
       │
       ▼
  [Express API Endpoints] –– (Handles POST /api/quotes, GET /api/quotes)
       │
       ▼
  [MongoDB Database] –– (Stores submissions in a "quotes" collection)

## Front-End Design
- **Form Structure:**
  - Fields: Contractor Name, Company, Roof Size (sq ft), Roof Type (Metal, TPO, Foam, etc.), Project City, Project State, Project Date.
  - Utilize Formik for state management and input validations (e.g., numerical checks for roof size and proper date pickers).
  - Use Axios to submit form data to the backend.

- **Component Breakdown:**
  - `QuoteForm.jsx` – Handles the input form, validations, and submission.
  - `ConfirmationMessage.jsx` – Displays success/error messages after form submission.
  - Navigation and footer components for consistency across pages.

## Back-End API Design
- **API Endpoints:**
  - **POST `/api/quotes`:**
    - Accepts JSON-formatted data from the form submission.
    - Validates received data.
    - Inserts a new record into MongoDB.
    - Returns a confirmation response.

  - **GET `/api/quotes`:**
    - Retrieves stored quote submissions.
    - Supports query parameters for filtering (e.g., `?state=TX`, `?roofType=Metal`).

- **Middleware & Utilities:**
  - CORS middleware for cross-origin requests.
  - Error handling middleware to capture and log issues.
  - Request logging with a tool (e.g., Morgan).

## Database Schema
- **Collection:** `quotes`
- **Document Fields:**
  - `_id` (automatically generated)
  - `contractorName`: String
  - `company`: String
  - `roofSize`: Number
  - `roofType`: String
  - `projectCity`: String
  - `projectState`: String
  - `projectDate`: Date
  - `createdAt`: Date (timestamp, auto-generated)
  - `updatedAt`: Date (timestamp, auto-updated)

## UI/UX & Styling
- **Responsive Design:**
  - Pure CSS using media queries for mobile, tablet, and desktop responsiveness.
  - Comment generously within CSS files to clarify layout decisions.

- **Navigation & Accessibility:**
  - Clear navigation cues with focus state management.
  - Intuitive layouts with sufficient contrast and element spacing.

## Error Handling, Logging & Security
- **Client-Side:**
  - Use Formik/Yup for input validation prior to submission.
  - Show user-friendly error messages.

- **Server-Side:**
  - Implement centralized error handling middleware.
  - Use Morgan for logging HTTP requests.
  - Ensure API security by sanitizing inputs and using appropriate CORS configurations.

## Testing & Deployment
- **Testing Strategy:**
  - Write unit tests for both React components (using Jest/React Testing Library) and API endpoints (using Mocha/Chai or Jest).
  - Integration testing for verifying end-to-end submissions.

- **Deployment:**
  - Use Git for version control and host the repository on GitHub.
  - Deploy on cloud platforms such as Heroku, AWS, or use Docker for containerization.
  - Provide deployment scripts/documentation for future iterations.

## Coding Guidelines & Next Steps
- **Coding Style:**
  - Follow industry-standard guidelines (e.g., Airbnb style guide for JavaScript/React).
  - Maintain clean, modular code with clear comments.

- **Next Steps:**
  - Develop a `README.md` detailing project summary, environment setup, local run instructions, and future improvements.
  - Schedule iterative development milestones, enabling continuous testing and feedback loops.
  - Consider future enhancements like real-time notifications and better analytics reports.
