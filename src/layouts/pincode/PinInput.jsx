import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types"; // Import PropTypes
import { FiCheckCircle } from "react-icons/fi";
import { BiErrorCircle } from "react-icons/bi";
import "./PinInput.css";
import { loginUser } from "api/api";
const PinInput = () => {
  const [pins, setPins] = useState(["", "", "", ""]);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [userName, setUserName] = useState("");
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index, value) => {
    if (isNaN(value)) return; // Only allow numbers
    const newPins = [...pins];
    newPins[index] = value;
    setPins(newPins);

    // Move to next input if current one is filled
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // If all inputs are filled, validate pin
    if (newPins.every((pin) => pin !== "")) {
      validatePin(newPins.join(""));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !pins[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const validatePin = async (pin) => {
    const result = await loginUser(pin);
    // Assume loginUser is defined elsewhere
    if (result.success) {
      setSuccess(true);
      setError(false);
      setUserName(result.user.name);
      setMessage("Success! Pin verified.");
      setPins(["", "", "", ""]);
      localStorage.setItem("jobRoles", JSON.stringify(result.user.jobRoles));
      window.location.reload(); // Reload the page after successful login

      // Store JWT token and simulate redirect or further actions
      localStorage.setItem("jwtToken", result.token); // Store token
      localStorage.setItem("username", result.user.name);
      localStorage.setItem("jwtTokenTimestamp", new Date().getTime().toString());
      // Store the user's name in the parent state
      setUserName(result.user.name); // Update the state with user's name

      setTimeout(() => {
        setSuccess(false);
        setMessage("");
      }, 2000);
    } else {
      setError(true);
      setSuccess(false);
      setMessage(result.error || "Invalid pin. Please try again.");
      setPins(["", "", "", ""]);
      inputRefs.current[0]?.focus();
      setTimeout(() => {
        setError(false);
        setMessage("");
      }, 2000);
    }
  };

  return (
    <div className="pin-input-container">
      <div className="pin-input-card">
        <h2 className="pin-input-title">Enter 4-Digit Pin</h2>

        <div className="pin-input-grid">
          {pins.map((pin, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              maxLength={1}
              value={pin}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`pin-input-box ${error ? "error" : ""} ${success ? "success" : ""} ${
                error ? "shake" : ""
              }`}
              aria-label={`Pin input ${index + 1}`}
            />
          ))}
        </div>

        {message && (
          <div className={`message-container ${error ? "error" : "success"}`}>
            {error ? (
              <BiErrorCircle className="message-icon" />
            ) : (
              <FiCheckCircle className="message-icon" />
            )}
            <span>{message}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Add PropTypes for setUserName
PinInput.propTypes = {
  setUserName: PropTypes.func.isRequired, // Ensuring setUserName is a required function
};

export default PinInput;
