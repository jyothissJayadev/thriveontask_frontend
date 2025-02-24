import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { format, differenceInSeconds } from "date-fns";
import { FiClock, FiCalendar, FiCheckCircle, FiAlertCircle, FiX } from "react-icons/fi";
import PropTypes from "prop-types";
import "./TaskUpdator.css";

import { updateCompletedUnits } from "api/api";
const TaskUpdator = ({ onClose, task }) => {
  // Function to generate the array with length and the number of `true` values at the beginning
  const generateArray = (length, trueCount) => {
    const array = new Array(length).fill(false); // Create an array of 'false' values
    for (let i = 0; i < trueCount; i++) {
      array[i] = true; // Set the first 'trueCount' elements to 'true'
    }
    return array;
  };

  console.log(task);
  const [length] = useState(task.numberOfUnits); // Initialize length from task's number of units
  const [trueCount, setTrueCount] = useState(task.completion); // Set trueCount from task's completion
  const [taskUnits, setTaskUnits] = useState(generateArray(length, trueCount)); // Initialize state with generated array
  const [currentUnit, setCurrentUnit] = useState(trueCount); // Set initial current unit after completed units

  const [startTime] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [unitStartTimes, setUnitStartTimes] = useState({});
  const [unitElapsedTime, setUnitElapsedTime] = useState(0);

  const completedUnits = useMemo(() => taskUnits.filter(Boolean).length, [taskUnits]);
  const completionPercentage = useMemo(
    () => (completedUnits / taskUnits.length) * 100,
    [completedUnits, taskUnits]
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if (currentUnit < taskUnits.length && unitStartTimes[currentUnit]) {
        setUnitElapsedTime(differenceInSeconds(new Date(), unitStartTimes[currentUnit]));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [currentUnit, unitStartTimes]);
  // Import the API function

  const handleUnitClick = useCallback(
    async (index) => {
      if (index === currentUnit && !taskUnits[index]) {
        const newUnits = [...taskUnits];
        newUnits[index] = true;
        setTaskUnits(newUnits);

        // Find the next incomplete unit after completing the current unit
        const nextUnit = taskUnits.findIndex((unit, i) => !unit && i > index);
        setCurrentUnit(nextUnit === -1 ? index : nextUnit); // Update to the next incomplete unit
        setUnitStartTimes((prev) => ({
          ...prev,
          [nextUnit === -1 ? index : nextUnit]: new Date(),
        }));
        setUnitElapsedTime(0);

        // Get the current list of completed units (count of true values in taskUnits)
        const completedUnits = newUnits.filter(Boolean).length;

        // Call the updateCompletedUnits API to update the server with the new completed units
        const token = localStorage.getItem("jwtToken");
        const taskId = task.id; // Assuming task.id is available

        const response = await updateCompletedUnits(taskId, completedUnits, token);

        if (response.success) {
          console.log("Successfully updated completed units.");
        } else {
          console.error("Error updating completed units:", response.error);
          // Optionally: Show an error message to the user
        }
      }
    },
    [currentUnit, taskUnits, task.id]
  );

  const getProgressColor = useMemo(() => {
    if (completionPercentage < 30) return "#FCD34D";
    if (completionPercentage < 70) return "#60A5FA";
    return "#34D399";
  }, [completionPercentage]);

  useEffect(() => {
    const currentUnitButton = document.querySelector(`.unit-button.current`);
    if (currentUnitButton) {
      currentUnitButton.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentUnit]);

  const isoDateString = task.startTime;

  function formatDate(inputDate) {
    const date = new Date(inputDate);
    const day = format(date, "d");
    const suffix =
      day === 1 || day === 21 || day === 31
        ? "st"
        : day === 2 || day === 22
        ? "nd"
        : day === 3 || day === 23
        ? "rd"
        : "th";
    const formattedDate = format(date, `dd MMM hh:mm a`);
    return formattedDate.replace(day, `${day}${suffix}`);
  }

  const formattedDate = formatDate(isoDateString);

  function calculateRemainingTime(endTime) {
    const currentTime = new Date();
    const endDate = new Date(endTime);
    const remainingSeconds = differenceInSeconds(endDate, currentTime);

    if (remainingSeconds <= 0) {
      return "Time has passed";
    }

    const days = Math.floor(remainingSeconds / (3600 * 24));
    const hours = Math.floor((remainingSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;

    const roundedSeconds = seconds >= 30 ? 60 : 0;
    const finalMinutes = minutes + (roundedSeconds === 60 ? 1 : 0);
    const finalSeconds = roundedSeconds === 60 ? 0 : seconds;

    const timeParts = [];
    if (days > 0) timeParts.push(`${days} day${days > 1 ? "s" : ""}`);
    if (hours > 0) timeParts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
    if (finalMinutes > 0) timeParts.push(`${finalMinutes} minute${finalMinutes > 1 ? "s" : ""}`);
    if (finalSeconds > 0) timeParts.push(`${finalSeconds} second${finalSeconds > 1 ? "s" : ""}`);

    return timeParts.join(", ");
  }

  const endTime = task.endDate;
  const remTime = calculateRemainingTime(endTime);

  return (
    <div className="container">
      <div className="main-content">
        <button onClick={onClose} className="close-button" aria-label="Close">
          <FiX className="close-icon" />
        </button>

        <header className="header">
          <h1 className="title">{task.name}</h1>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <FiCheckCircle className="stat-icon" />
                <span>Total Units</span>
              </div>
              <div className="stat-value">{task.numberOfUnits}</div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <FiAlertCircle className="stat-icon" />
                <span>Incomplete Units</span>
              </div>
              <div className="stat-value">{task.numberOfUnits - task.completion}</div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <FiCalendar className="stat-icon" />
                <span>Start Time</span>
              </div>
              {formattedDate}
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <FiCalendar className="stat-icon" />
                <span>End Time</span>
              </div>
              {remTime}
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <FiClock className="stat-icon" />
                <span>Current Unit Time</span>
              </div>
              <div className="stat-value">{unitElapsedTime}s</div>
            </div>
          </div>
        </header>

        <div className="progress-section">
          <div className="progress-circle">
            <CircularProgressbar
              value={completionPercentage}
              text={`${Math.round(completionPercentage)}%`}
              styles={buildStyles({
                pathColor: getProgressColor,
                textColor: getProgressColor,
                trailColor: "#E5E7EB",
              })}
            />
          </div>
          <div className="units-grid">
            {taskUnits.map((completed, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`unit-button ${
                  completed ? "completed" : index === currentUnit ? "current" : "inactive"
                }`}
                onClick={() => handleUnitClick(index)}
                disabled={completed || index !== currentUnit}
                aria-label={`Unit ${index + 1} ${completed ? "completed" : "incomplete"}`}
              >
                {completed ? <FiCheckCircle className="text-2xl" /> : index + 1}
              </motion.button>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {completedUnits === taskUnits.length && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="completion-message"
            >
              Congratulations! All units successfully completed! 🎉
            </motion.div>
          )}
        </AnimatePresence>

        <div className="action-container">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`action-button ${currentUnit < taskUnits.length ? "active" : "disabled"}`}
            onClick={() => handleUnitClick(currentUnit)}
            disabled={currentUnit >= taskUnits.length}
          >
            {currentUnit < taskUnits.length ? "Complete Next Unit" : "All Units Completed"}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

TaskUpdator.propTypes = {
  onClose: PropTypes.func.isRequired,
  task: PropTypes.object.isRequired,
};

export default TaskUpdator;
