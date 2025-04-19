import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { submitQuote } from "../utils/api";
import ConfirmationMessage from "./ConfirmationMessage";
import "./QuoteForm.css";

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

const validationSchema = Yup.object().shape({
  contractorName: Yup.string()
    .required("Contractor name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .matches(
      /^[a-zA-Z\s-']+$/,
      "Name can only contain letters, spaces, hyphens and apostrophes"
    ),
  company: Yup.string()
    .required("Company name is required")
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name must be less than 100 characters"),
  roofSize: Yup.number()
    .required("Roof size is required")
    .positive("Must be a positive number")
    .max(1000000, "Roof size seems too large. Please verify")
    .typeError("Must be a number"),
  roofType: Yup.string()
    .required("Roof type is required")
    .oneOf(
      ["Metal", "TPO", "Foam", "Other"],
      "Please select a valid roof type"
    ),
  projectCity: Yup.string()
    .required("Project city is required")
    .matches(
      /^[a-zA-Z\s-']+$/,
      "City name can only contain letters, spaces, hyphens and apostrophes"
    ),
  projectState: Yup.string()
    .required("Project state is required")
    .oneOf(
      US_STATES.map((state) => state.code),
      "Please select a valid state"
    ),
  projectDate: Yup.date()
    .required("Project date is required")
    .min(new Date(), "Project date cannot be in the past")
    .max(
      new Date(new Date().setFullYear(new Date().getFullYear() + 2)),
      "Project date cannot be more than 2 years in the future"
    ),
});

const QuoteForm = () => {
  const [submitStatus, setSubmitStatus] = useState({
    message: "",
    isError: false,
  });

  const initialValues = {
    contractorName: "",
    company: "",
    roofSize: "",
    roofType: "",
    projectCity: "",
    projectState: "",
    projectDate: "",
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await submitQuote(values);
      setSubmitStatus({
        message:
          "Quote submitted successfully! We'll review your submission and get back to you soon.",
        isError: false,
      });
      resetForm();
    } catch (error) {
      setSubmitStatus({
        message: error.message || "Error submitting quote. Please try again.",
        isError: true,
      });
    } finally {
      setSubmitting(false);
      window.scrollTo(0, 0); // Scroll to top to show the confirmation message
    }
  };

  return (
    <div className="quote-form-container">
      <h2>Submit Roofing Project Quote</h2>
      {submitStatus.message && (
        <ConfirmationMessage
          message={submitStatus.message}
          isError={submitStatus.isError}
        />
      )}
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, isSubmitting, setFieldValue }) => (
          <Form className="quote-form">
            <div className="form-group">
              <label htmlFor="contractorName">Contractor Name *</label>
              <Field
                name="contractorName"
                type="text"
                className={
                  touched.contractorName && errors.contractorName ? "error" : ""
                }
              />
              <ErrorMessage
                name="contractorName"
                component="div"
                className="error-message"
              />
            </div>

            <div className="form-group">
              <label htmlFor="company">Company Name *</label>
              <Field
                name="company"
                type="text"
                className={touched.company && errors.company ? "error" : ""}
              />
              <ErrorMessage
                name="company"
                component="div"
                className="error-message"
              />
            </div>

            <div className="form-group">
              <label htmlFor="roofSize">Roof Size (sq ft) *</label>
              <Field
                name="roofSize"
                type="number"
                min="0"
                className={touched.roofSize && errors.roofSize ? "error" : ""}
              />
              <ErrorMessage
                name="roofSize"
                component="div"
                className="error-message"
              />
            </div>

            <div className="form-group">
              <label htmlFor="roofType">Roof Type *</label>
              <Field
                as="select"
                name="roofType"
                className={touched.roofType && errors.roofType ? "error" : ""}
              >
                <option value="">Select a roof type</option>
                <option value="Metal">Metal</option>
                <option value="TPO">TPO</option>
                <option value="Foam">Foam</option>
                <option value="Other">Other</option>
              </Field>
              <ErrorMessage
                name="roofType"
                component="div"
                className="error-message"
              />
            </div>

            <div className="form-group">
              <label htmlFor="projectCity">Project City *</label>
              <Field
                name="projectCity"
                type="text"
                className={
                  touched.projectCity && errors.projectCity ? "error" : ""
                }
              />
              <ErrorMessage
                name="projectCity"
                component="div"
                className="error-message"
              />
            </div>

            <div className="form-group">
              <label htmlFor="projectState">Project State *</label>
              <Field
                as="select"
                name="projectState"
                className={
                  touched.projectState && errors.projectState ? "error" : ""
                }
              >
                <option value="">Select a state</option>
                {US_STATES.map((state) => (
                  <option key={state.code} value={state.code}>
                    {state.name} ({state.code})
                  </option>
                ))}
              </Field>
              <ErrorMessage
                name="projectState"
                component="div"
                className="error-message"
              />
            </div>

            <div className="form-group">
              <label htmlFor="projectDate">Project Date *</label>
              <Field
                name="projectDate"
                type="date"
                className={
                  touched.projectDate && errors.projectDate ? "error" : ""
                }
                min={new Date().toISOString().split("T")[0]}
              />
              <ErrorMessage
                name="projectDate"
                component="div"
                className="error-message"
              />
            </div>

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Quote"}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default QuoteForm;
