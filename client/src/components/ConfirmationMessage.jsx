import React, { useEffect, useState } from "react";
import "./ConfirmationMessage.css";

const ConfirmationMessage = ({ message, isError }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
    const timer = setTimeout(() => setShow(false), 5000);
    return () => clearTimeout(timer);
  }, [message]);

  const icon = isError ? "❌" : "✅";

  return (
    <div
      className={`confirmation-message ${isError ? "error" : "success"} ${
        show ? "show" : ""
      }`}
    >
      <span className="icon">{icon}</span>
      <span className="message">{message}</span>
    </div>
  );
};

export default ConfirmationMessage;
