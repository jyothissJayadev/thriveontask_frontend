import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { format, differenceInSeconds } from "date-fns";
import { FiClock, FiCalendar, FiCheckCircle, FiAlertCircle, FiX } from "react-icons/fi";
import "./TaskUpdator.css";
import cling from "./audio.mp3";
import complete from "./complete1.mp3";
import { updateCompletedUnits, getTaskById } from "api/api";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import toast, { Toaster } from "react-hot-toast";
import { updateSpeedTasks } from "api/api";
const TaskUpdator = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("jwtToken");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [unitStartTimes, setUnitStartTimes] = useState({});
  const [unitElapsedTime, setUnitElapsedTime] = useState(0);
  const [taskUnits, setTaskUnits] = useState([]);
  const [currentUnit, setCurrentUnit] = useState(0);
  const [showScratchAnimation, setShowScratchAnimation] = useState(false);
  const [scratchComplete, setScratchComplete] = useState(false);
  const audioRef = useRef(null);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const hasShownToast = useRef(false);

  // Function to generate the array with length and the number of `true` values at the beginning
  const generateArray = (length, trueCount) => {
    const array = new Array(length).fill(false); // Create an array of 'false' values
    for (let i = 0; i < trueCount; i++) {
      array[i] = true; // Set the first 'trueCount' elements to 'true'
    }
    return array;
  };

  // Setup audio for completion sounds
  useEffect(() => {
    // Create audio element for completion sound
    const audio = new Audio();
    audio.src = cling; // Replace with your sound URL
    audioRef.current = audio;

    return () => {
      // Cleanup
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  // Initialize canvas for scratch effect
  useEffect(() => {
    if (showScratchAnimation && containerRef.current && !canvasRef.current) {
      const container = containerRef.current;
      const canvas = document.createElement("canvas");
      canvas.className = "scratch-canvas";

      // Make the canvas position relative to the container instead of fixed
      canvas.style.position = "absolute";
      canvas.style.top = "0";
      canvas.style.left = "0";
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.zIndex = "9999";
      canvas.style.pointerEvents = "none";

      // Set canvas dimensions to match the container
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      // Append to the container instead of body
      container.appendChild(canvas);
      canvasRef.current = canvas;

      const ctx = canvas.getContext("2d");
      let points = [];
      let lastTime = 0;

      const drawScratch = (timestamp) => {
        if (!lastTime) lastTime = timestamp;
        const elapsed = timestamp - lastTime;
        lastTime = timestamp;

        if (points.length < 200) {
          // Generate random points within the container dimensions
          const x = Math.random() * rect.width;
          const y = Math.random() * rect.height;
          points.push({ x, y });
        }

        // Draw lines connecting points
        ctx.strokeStyle = "black";
        ctx.lineWidth = 5;
        ctx.lineCap = "round";

        for (let i = 0; i < points.length - 1; i++) {
          ctx.beginPath();
          ctx.moveTo(points[i].x, points[i].y);
          ctx.lineTo(points[i + 1].x, points[i + 1].y);
          ctx.stroke();
        }

        if (points.length < 200) {
          requestAnimationFrame(drawScratch);
        } else {
          // Animation complete, navigate instead of reloading
          setTimeout(() => {
            setScratchComplete(true);
            // Clean up canvas
            if (canvasRef.current) {
              container.removeChild(canvasRef.current);
              canvasRef.current = null;
            }

            // Make sure any audio is stopped before navigating
            if (audioRef.current) {
              audioRef.current.pause();
            }

            // Then navigate
            navigate("/tasks", { state: { message: "All tasks completed successfully!" } });
          }, 500);
        }
      };

      requestAnimationFrame(drawScratch);
    }
  }, [showScratchAnimation]);
  useEffect(() => {
    if (task && task.lock === 2 && !hasShownToast.current) {
      toast.error("The Parent Task Cannot be Modified.");
      hasShownToast.current = true; // Mark toast as shown
    }
  }, [task]);
  // Fetch task data
  useEffect(() => {
    async function fetchTask() {
      try {
        const response = await getTaskById(taskId, token);
        if (response.success) {
          setTask(response.task);
          // Initialize task units after task is loaded
          const length = response.task.numberOfUnits;
          const trueCount = response.task.completedUnits;
          setTaskUnits(generateArray(length, trueCount));
          setCurrentUnit(trueCount);
          // Initialize start time for current unit
          setUnitStartTimes({
            [trueCount]: new Date(),
          });
        } else {
          console.error("Error fetching task:", response.error);
        }
      } catch (error) {
        console.error("Error fetching task:", error);
      } finally {
        setLoading(false);
      }
    }

    if (taskId) {
      fetchTask();
    } else {
      setLoading(false);
    }
  }, [taskId, token]);

  // Timer effect
  useEffect(() => {
    if (!task) return;

    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if (currentUnit < task.numberOfUnits && unitStartTimes[currentUnit]) {
        setUnitElapsedTime(differenceInSeconds(new Date(), unitStartTimes[currentUnit]));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [currentUnit, unitStartTimes, task]);

  // With this:
  useEffect(() => {
    if (!task) return;

    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if (currentUnit < task.numberOfUnits && task.updatedAt) {
        const secondsDiff = differenceInSeconds(new Date(), new Date(task.updatedAt));
        setUnitElapsedTime(secondsDiff);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [currentUnit, task]);

  // Add a function to format the elapsed time
  const formatElapsedTime = (seconds) => {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    } else if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    } else {
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);
      return `${days}d ${hours}h`;
    }
  };
  const completedUnits = useMemo(() => taskUnits.filter(Boolean).length, [taskUnits]);

  const completionPercentage = useMemo(
    () => (task && taskUnits.length > 0 ? (completedUnits / taskUnits.length) * 100 : 0),
    [completedUnits, taskUnits, task]
  );

  useEffect(() => {
    // Check if all units JUST became completed (was not already completed)
    if (
      task &&
      completedUnits === task.numberOfUnits &&
      !showScratchAnimation &&
      // Add this check to ensure it's a new completion and not a revisit
      completedUnits > 0 &&
      completedUnits > task.completedUnits
    ) {
      // Play a final completion sound
      if (audioRef.current) {
        audioRef.current.src = complete;
        const playPromise = audioRef.current.play();

        // Handle the play promise to avoid the interrupted error
        if (playPromise !== undefined) {
          playPromise
            .then((_) => {
              // Playback started successfully
            })
            .catch((error) => {
              // Auto-play was prevented or playback was interrupted
              console.log("Audio playback interrupted:", error);
            });
        }
      }

      // Show celebration first, then trigger scratch after delay
      setTimeout(() => {
        setShowScratchAnimation(true);
      }, 2000);
    }
  }, [completedUnits, task, showScratchAnimation]);
  function convertToSeconds(timestamp) {
    // Parse the timestamp into a Date object
    const date = new Date(timestamp);

    // Get the time in milliseconds and convert it to seconds
    return Math.floor(date.getTime() / 1000);
  }
  function calculateSpeed(createtime, endtime, updatetime) {
    // Calculate the speed based on the provided formula
    let speed = ((createtime - endtime) / (createtime - updatetime)) * 100;
    // Cap the speed at 100 if it's greater than 100
    if (speed > 100) {
      speed = 100;
    }

    // Convert to a natural number if it's an integer
    if (Number.isInteger(speed)) {
      speed = Math.floor(speed); // Remove decimals and convert to natural number
    }

    return speed;
  }
  const handleUnitClick = useCallback(
    async (index) => {
      if (!task) return;

      if (index === currentUnit && !taskUnits[index]) {
        const newUnits = [...taskUnits];
        newUnits[index] = true;
        setTaskUnits(newUnits);

        // Play the completion sound
        if (audioRef.current) {
          try {
            audioRef.current.currentTime = 0;
            const playPromise = audioRef.current.play();

            // Handle the play promise
            if (playPromise !== undefined) {
              playPromise.catch((error) => {
                console.log("Audio playback error:", error);
                // Just log the error and continue, don't let it crash the component
              });
            }
          } catch (error) {
            console.log("Error playing audio:", error);
            // Handle the error gracefully
          }
        }
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
        const createtime = convertToSeconds(task.createdAt);
        const endtime = convertToSeconds(task.endDate);
        const updatetime = Math.floor(Date.now() / 1000);
        // Call the updateCompletedUnits API to update the server with the new completed units
        const response = await updateCompletedUnits(task._id, completedUnits, token);
        const speed = calculateSpeed(createtime, endtime, updatetime);

        if (response.success) {
          console.log("Successfully updated completed units.");
          if (completedUnits === task.numberOfUnits) {
            const response1 = await updateSpeedTasks(task._id, speed, token);
            toast.success("The task has been Completed");
            if (response1.message) {
              console.log("Successfully updated speed.");
            } else {
              console.error("Error updating speed:");
              // Optionally: Show an error message to the user
            }
          }
        } else {
          console.error("Error updating completed units:", response.error);
          // Optionally: Show an error message to the user
        }
      }
    },
    [currentUnit, taskUnits, task, token]
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

  const handleClose = () => {
    navigate(-1); // Go back to previous page
  };

  function formatDate(inputDate) {
    if (!inputDate) return "";

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

  if (!task) {
    return <div className="error-container">Task not found</div>;
  }

  const formattedDate = formatDate(task.createdAt);
  const remTime = formatDate(task.endDate);

  return (
    <DashboardLayout>
      <div className="container" ref={containerRef}>
        <div className="main-content">
          {!scratchComplete && (
            <>
              <button onClick={handleClose} className="close-button" aria-label="Close">
                <FiX className="close-icon" />
              </button>

              <header className="header">
                <motion.h1
                  className="title"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {task.taskName}
                </motion.h1>
                <div className="stats-grid">
                  <motion.div
                    className="stat-card"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <div className="stat-header">
                      <FiCheckCircle className="stat-icon" />
                      <span>Total Units</span>
                    </div>
                    <div className="stat-value">{task.numberOfUnits}</div>
                  </motion.div>
                  <motion.div
                    className="stat-card"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <div className="stat-header">
                      <FiAlertCircle className="stat-icon" />
                      <span>Incomplete Units</span>
                    </div>
                    <div className="stat-value">{task.numberOfUnits - completedUnits}</div>
                  </motion.div>
                  <motion.div
                    className="stat-card"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    <div className="stat-header">
                      <FiCalendar className="stat-icon" />
                      <span>Start Time</span>
                    </div>
                    {formattedDate}
                  </motion.div>
                  <motion.div
                    className="stat-card"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    <div className="stat-header">
                      <FiCalendar className="stat-icon" />
                      <span>End Time</span>
                    </div>
                    {remTime}
                  </motion.div>
                  <motion.div
                    className="stat-card"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                  >
                    <div className="stat-header">
                      <FiClock className="stat-icon" />
                      <span>Current Unit Time</span>
                    </div>
                    <div className="stat-value">{formatElapsedTime(unitElapsedTime)}</div>
                  </motion.div>
                </div>
              </header>

              <div className="progress-section">
                <motion.div
                  className="progress-circle"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.6,
                  }}
                >
                  <CircularProgressbar
                    value={completionPercentage}
                    text={`${Math.round(completionPercentage)}%`}
                    styles={buildStyles({
                      pathColor: getProgressColor,
                      textColor: getProgressColor,
                      trailColor: "#E5E7EB",
                      // Added animation
                      pathTransition: "stroke-dashoffset 0.5s ease 0s",
                    })}
                  />
                </motion.div>
                <div className="units-grid">
                  {taskUnits.map((completed, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: completed ? [1, 1.2, 1] : 1, // Pulse animation for completed units
                      }}
                      transition={{
                        duration: 0.3,
                        delay: 0.1 * index,
                        scale: { duration: 0.5 },
                      }}
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
                {completedUnits === task.numberOfUnits && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: [1, 1.1, 1], // Pulse animation
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 0.5,
                      scale: {
                        repeat: 2,
                        duration: 0.5,
                      },
                    }}
                    className="completion-message"
                  >
                    <span role="img" aria-label="celebration">
                      🎉
                    </span>{" "}
                    Congratulations! All units successfully completed!{" "}
                    <span role="img" aria-label="celebration">
                      🎉
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="action-container">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.8 }}
                  className={`action-button ${
                    task.lock === 2
                      ? "disabled"
                      : currentUnit < task.numberOfUnits
                      ? "active"
                      : "disabled"
                  }`}
                  onClick={() => handleUnitClick(currentUnit)}
                  disabled={task.lock === 2 || currentUnit >= task.numberOfUnits}
                >
                  {task.lock === 2
                    ? "Task Locked"
                    : currentUnit < task.numberOfUnits
                    ? "Complete Next Unit"
                    : "All Units Completed"}
                </motion.button>
              </div>
            </>
          )}
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 5000,
            style: {
              background: "#363636",
              color: "#fff",
            },
            success: {
              style: {
                background: "#4CAF50",
              },
            },
            error: {
              style: {
                background: "#F44336",
              },
            },
          }}
        />
      </div>
    </DashboardLayout>
  );
};

export default TaskUpdator;
