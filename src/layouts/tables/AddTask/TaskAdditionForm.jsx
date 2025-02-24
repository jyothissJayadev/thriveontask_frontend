import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import PropTypes from "prop-types"; // Import prop-types
import { createTask } from "api/api"; // Assuming the createTask API function is in api.js
import "./TaskAdditionForm.css";

const TaskAdditionForm = ({ onClose, timeframe }) => {
  const [formData, setFormData] = useState({
    taskName: "",
    units: "10",
    datetime: "",
  });
  const token = localStorage.getItem("jwtToken");
  const [errors, setErrors] = useState({});

  // Validate only the specific field
  const validateField = (name, value) => {
    let error = "";

    if (name === "taskName") {
      if (!value) {
        error = "Task name is required";
      } else if (value.length < 3) {
        error = "Task name must be at least 3 characters";
      } else if (value.length > 100) {
        error = "Task name must not exceed 100 characters";
      }
    } else if (name === "units") {
      if (!value) {
        error = "Number of units is required";
      } else if (parseInt(value) < 1 || parseInt(value) > 100) {
        error = "Units must be between 1 and 100";
      }
    } else if (name === "datetime") {
      if (!value) {
        error = "Hour is required";
      } else if (parseInt(value) < 1 || parseInt(value) > 30) {
        error = "Please select an hour between 1 and 30";
      }
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "units" && value === "" ? "100" : value,
    }));
  };

  // Handle blur (validation when input field loses focus)
  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields before submitting
    if (
      !errors.taskName &&
      !errors.units &&
      !errors.datetime &&
      formData.taskName &&
      formData.units &&
      formData.datetime
    ) {
      const response = await createTask(
        formData.taskName,
        parseInt(formData.units), // Ensure units is an integer
        1, // completedUnits
        formData.datetime,
        timeframe,
        token
      );
      if (response.success) {
        toast.success("Task added successfully!");
        // Set a timer of 3 seconds before closing
        setTimeout(() => {
          onClose();
          setFormData({
            taskName: "",
            units: "100",
            datetime: "",
          });
          window.location.reload();
        }, 3000); // 3000 ms = 3 seconds
      } else {
        toast.error(response.error || "Error adding task.");
      }
    }
  };

  const handleClose = () => {
    onClose();
  };

  const isFormValid = () => {
    return (
      formData.taskName &&
      formData.units &&
      formData.datetime &&
      !Object.values(errors).some((error) => error !== "")
    );
  };

  return (
    <div className="container">
      <div className="blob"></div>
      <div className="blob blob-right"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="form-wrapper"
      >
        <div className="form-header">
          <svg
            className="w-8 h-8 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h2>Add New Task</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="input-group">
            <label htmlFor="taskName">Task Name</label>
            <input
              type="text"
              id="taskName"
              name="taskName"
              value={formData.taskName}
              onChange={handleChange}
              onBlur={handleBlur} // Added onBlur for validation
              placeholder="Enter task name"
              className={errors.taskName ? "error" : ""}
            />
            {errors.taskName && <p className="error-message">{errors.taskName}</p>}
          </div>

          <div className="input-group">
            <label htmlFor="timeFrame">Timeframe</label>
            <input
              type="text"
              id="timeFrame"
              name="timeFrame"
              value={timeframe}
              readOnly
              placeholder="Timeframe"
              className={errors.timeframe ? "error" : ""}
            />
            {errors.timeframe && <p className="error-message">{errors.timeframe}</p>}
          </div>

          <div className="input-group">
            <label htmlFor="units">Number of Units</label>
            <input
              type="number"
              id="units"
              name="units"
              value={formData.units}
              onChange={handleChange}
              onBlur={handleBlur} // Added onBlur for validation
              min="1"
              max="100"
              placeholder="Number of units"
              className={errors.units ? "error" : ""}
            />
            {errors.units && <p className="error-message">{errors.units}</p>}
          </div>

          <div className="input-group">
            <label htmlFor="hours">Select Hour</label>
            <input
              type="number"
              id="hours"
              name="datetime" // Keep the same name for consistency
              value={formData.datetime}
              onChange={handleChange}
              onBlur={handleBlur} // Added onBlur for validation
              min="1"
              max="30"
              placeholder="Select hour (1-30)"
              className={errors.datetime ? "error" : ""}
            />
            {errors.datetime && <p className="error-message">{errors.datetime}</p>}
          </div>

          <div className="button">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={!isFormValid()}
              className={`submit ${!isFormValid() ? "disabled" : ""}`}
            >
              Add Task
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleClose}
              className="reset"
            >
              Close
            </motion.button>
          </div>
        </form>
      </motion.div>
      <ToastContainer position="bottom-left" autoClose={3000} />
    </div>
  );
};

// Add propTypes validation
TaskAdditionForm.propTypes = {
  onClose: PropTypes.func.isRequired,
  timeframe: PropTypes.string.isRequired, // Validate timeframe to be a string
};

export default TaskAdditionForm;
