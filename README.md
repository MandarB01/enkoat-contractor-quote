# Contractor Quote Submission Portal

A full-stack web application that enables contractors to submit and manage roofing project quotes. The application features a responsive form interface for quote submissions and a searchable list view of submitted quotes, built with React for the frontend and Node.js/Express for the backend, utilizing MongoDB for data storage.

## Features

- **Interactive Quote Submission Form:** Uses Formik for efficient form handling and Yup for robust validation on the client-side. Server-side validation ensures data integrity.
- **Quote Listing & Filtering:** Displays submitted quotes with options to filter by project state and roof type.
- **Responsive Design:** Adapts seamlessly to various screen sizes (desktop, tablet, mobile) using pure CSS.
- **Real-time Form Validation:** Provides immediate feedback to users as they fill out the form.
- **RESTful API Backend:** Built with Express.js, providing endpoints for quote management.
- **Data Persistence:** Utilizes MongoDB with Mongoose ODM for storing and retrieving quote data.
- **Security:** Implements basic security measures like CORS, Helmet, rate limiting, and input sanitization.
- **Logging:** Uses Morgan for HTTP request logging and Winston (via `loggerUtil.js`) for application-level logging.
- **PDF Export:** Functionality to generate a PDF for a single quote.

## Project Structure

```
enkoat-contractor-quote/
├── client/         # React Frontend Application
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/ # React components (Form, List, etc.)
│   │   ├── styles/     # CSS styles
│   │   ├── utils/      # API client (api.js)
│   │   ├── App.jsx     # Main application component
│   │   └── index.jsx   # Entry point
│   └── package.json
├── server/         # Node.js/Express Backend API
│   ├── logs/         # Log files (access, error)
│   ├── src/
│   │   ├── config/     # Database configuration (db.js)
│   │   ├── controllers/ # Request handlers (quoteController.js)
│   │   ├── middleware/ # Express middleware (validation, security, logging)
│   │   ├── models/     # Mongoose models (Quote.js)
│   │   ├── routes/     # API routes (api.js)
│   │   ├── utils/      # Utility functions (validation, generators)
│   │   └── app.js      # Express application setup
│   └── package.json
├── README.md           # Main Project README (This file)
└── ContractorQuoteSubmissionPortal.md # Additional documentation
```

## Technology Stack

### Frontend

- **React:** v17+ (UI Library)
- **React Router:** v6 (Client-side routing)
- **Formik:** Form management
- **Yup:** Schema-based validation
- **Axios:** HTTP client for API communication
- **CSS:** Custom CSS for styling (no UI framework)
- **Testing:** `@testing-library/react`, `jest-dom`

### Backend

- **Node.js:** v14+ (Runtime environment)
- **Express:** v4 (Web framework)
- **MongoDB:** Database for storing quotes
- **Mongoose:** v8+ (ODM for MongoDB)
- **dotenv:** Environment variable management
- **CORS:** Cross-Origin Resource Sharing middleware
- **Helmet:** Security headers middleware
- **express-rate-limit:** API rate limiting
- **express-validator:** Server-side request validation
- **Morgan:** HTTP request logger middleware
- **hpp:** HTTP Parameter Pollution protection
- **express-mongo-sanitize:** MongoDB query sanitization
- **xss-clean:** Cross-site scripting (XSS) protection
- **pdfkit:** PDF generation library
- **Testing:** `jest`, `supertest`, `mongodb-memory-server`

## Getting Started

### Prerequisites

- Node.js (v16 or higher recommended)
- MongoDB (v5 or higher, local instance or Atlas)
- npm (v7 or higher) or yarn

### Local Development Setup

1.  **Clone the repository:**

    ```bash
    git clone [repository-url]
    cd enkoat-contractor-quote
    ```

2.  **Setup Backend:**

    ```bash
    cd server
    npm install

    # Create a .env file in the server directory with the following variables:
    # PORT=3001
    # MONGODB_URI=your MongoDB Atlas connection string
    # NODE_ENV=development

    npm run dev # Starts the server with nodemon for auto-reloading
    ```

    The backend API will be running on `http://localhost:3001` (or the port specified in `.env`).

3.  **Setup Frontend:**
    ```bash
    cd client
    npm install
    npm start   # Starts the React development server
    ```
    The frontend application will be available at `http://localhost:3000`. It proxies API requests to `http://localhost:3001`.

## Data Model

The core data model is the `Quote`, defined in `server/src/models/Quote.js`.

**Quote Schema:**

| Field          | Type   | Required | Validation/Constraints                                     | Description                       |
| -------------- | ------ | -------- | ---------------------------------------------------------- | --------------------------------- |
| contractorName | String | Yes      | Trimmed, 2-100 chars, sanitized                            | Name of the contractor            |
| company        | String | Yes      | Trimmed, 2-100 chars, sanitized                            | Contractor's company name         |
| roofSize       | Number | Yes      | 1 - 1,000,000 sq ft                                        | Size of the roof in square feet   |
| roofType       | String | Yes      | Enum: 'Metal', 'TPO', 'Foam', 'Other'                      | Type of roofing material          |
| projectCity    | String | Yes      | Trimmed, sanitized                                         | City of the project               |
| projectState   | String | Yes      | Uppercase, 2-letter US state code                          | State of the project              |
| projectDate    | Date   | Yes      | Must be a valid date between now and 2 years in the future | Planned start date of the project |
| createdAt      | Date   | Auto     | Automatically generated by Mongoose (`timestamps: true`)   | Timestamp of quote creation       |
| updatedAt      | Date   | Auto     | Automatically generated by Mongoose (`timestamps: true`)   | Timestamp of last update          |

**Indexes:**

- `{ projectState: 1, roofType: 1 }` for efficient filtering.
- `{ createdAt: -1 }` for sorting by creation date.

**Virtuals:**

- `location`: Returns a combined string `projectCity, projectState`.

## API Endpoints

All endpoints are prefixed with `/api`.

| Method | Path              | Rate Limit         | Description                                       | Request Body / Query Params                                                                     | Response Body (Success: 2xx)                                                             | Response Body (Error: 4xx/5xx)                                                                     |
| :----- | :---------------- | :----------------- | :------------------------------------------------ | :---------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------- |
| `POST` | `/quotes`         | 10/hour per IP     | Submits a new quote.                              | **Body:** `Quote` object (see Data Model)                                                       | `201 Created`: `{ status: 'success', data: { quote: <new_quote_object> } }`              | `400 Bad Request`: Validation errors <br> `429 Too Many Requests` <br> `500 Internal Server Error` |
| `GET`  | `/quotes`         | 100/15 mins per IP | Retrieves a list of quotes.                       | **Query:** `state` (e.g., TX), `roofType` (e.g., Metal), `page`, `limit`, `sortBy`, `sortOrder` | `200 OK`: `{ status: 'success', results: <count>, data: { quotes: [<quote_objects>] } }` | `429 Too Many Requests` <br> `500 Internal Server Error`                                           |
| `GET`  | `/quotes/:id/pdf` | 100/15 mins per IP | Generates and returns a PDF for a specific quote. | **Param:** `id` (Quote MongoDB ObjectId)                                                        | `200 OK`: PDF file stream (`Content-Type: application/pdf`)                              | `404 Not Found` <br> `429 Too Many Requests` <br> `500 Internal Server Error`                      |

## Middleware (Server-side)

The backend utilizes several middleware functions for various purposes:

- **`security.js`:** Configures `helmet`, `cors`, `hpp`, `xss-clean`, `express-mongo-sanitize`.
- **`logger.js`:** Configures `morgan` for HTTP request logging.
- **`rateLimit` (in `api.js`):** Applies rate limiting to specific endpoints using `express-rate-limit`.
- **`validateRequest.js`:** Handles validation errors collected by `express-validator` (used in `quoteController.js`).
- **`errorHandler.js`:** Centralized error handling for catching and formatting API errors.

## Testing

- **Frontend:** Unit/integration tests for React components (`QuoteForm`, `QuotesList`) are located in `client/src/components/__tests__` and run using `react-scripts test`.
- **Backend:**
  - Unit tests for utility functions (e.g., `validation.js`) are in `server/src/utils/__tests__`.
  - Integration tests for API endpoints (`api.test.js`) and controllers (`quoteController.test.js`) are located in `server/src/__tests__` and `server/src/controllers/__tests__`.
  - Tests use Jest, Supertest for API requests, and `mongodb-memory-server` for an in-memory MongoDB instance. Run tests using `npm test` in the `server` directory.

## Sample Data

For testing purposes, you can use these example quotes:

```json
{
  "contractorName": "John Smith",
  "company": "Smith Roofing LLC",
  "roofSize": 2500,
  "roofType": "Metal",
  "projectCity": "Austin",
  "projectState": "TX",
  "projectDate": "2025-05-15"
}
```

```json
{
  "contractorName": "Sarah Johnson",
  "company": "Johnson & Co Construction",
  "roofSize": 3200,
  "roofType": "TPO",
  "projectCity": "Phoenix",
  "projectState": "AZ",
  "projectDate": "2025-06-01"
}
```

## Future Improvements

Given more time, these enhancements would be valuable additions:

1. Authentication & Authorization

   - User accounts for contractors
   - Role-based access control
   - Secure API endpoints

2. Enhanced Features

   - File upload for project documents in the quote form
   - Advanced search/filter capabilities

3. Technical Improvements
   - Enhanced tests coverage
   - CI/CD pipeline setup
   - Rate limiting and API security
