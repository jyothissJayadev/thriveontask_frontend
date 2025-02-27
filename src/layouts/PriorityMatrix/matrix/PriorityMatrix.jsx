import React, { useState, useEffect } from "react";
import {
  GripVertical,
  MoreVertical,
  Plus,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast"; // Add this import
import "./PriorityMatrix.css";
import { getTasks, updateTaskPriority } from "../../../api/api"; // Import the API functions

const PriorityMatrix = () => {
  const priorities = {
    urgent: { title: "Urgent", color: "#dc2626", bgColor: "#fef2f2", value: 1 },
    high: { title: "High", color: "#ea580c", bgColor: "#fff7ed", value: 2 },
    medium: { title: "Medium", color: "#2563eb", bgColor: "#eff6ff", value: 3 },
    low: { title: "Low", color: "#16a34a", bgColor: "#f0fdf4", value: 4 },
  };

  // State for tasks separated by timeframe
  const [tasks, setTasks] = useState({
    day: [],
    week: [],
    month: [],
  });

  // Active timeframe selection
  const [activeTimeframe, setActiveTimeframe] = useState("day");
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({
    id: "",
    name: "",
    time: "",
    progress: 0,
    priority: null, // null means it's in the parent container
    endDate: null, // End date for the task
    numberOfUnits: 0, // Total units for the task
    completedUnits: 0, // Completed units
    priorityCode: "", // ABC priority code
    timeframe: "day", // Default timeframe
  });
  const [draggedTask, setDraggedTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch tasks from API and organize by timeframe
  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("jwtToken"); // Assuming token is stored in localStorage
      const response = await getTasks(token);

      if (response.success === false) {
        throw new Error(response.error || "Failed to fetch tasks");
      }

      // Group tasks by timeframe
      const groupedTasks = {
        day: [],
        week: [],
        month: [],
      };

      response.tasks.forEach((task) => {
        // Transform API tasks to include necessary fields
        const transformedTask = {
          id: task._id || task.id,
          name: task.name || task.title || task.taskName,
          time: task.estimatedTime || 0,
          progress: calculateProgress(task.completedUnits, task.numberOfUnits),
          priority: getPriorityFromCode(task.priority), // Convert priority code to matrix container
          endDate: task.endDate || null,
          numberOfUnits: task.numberOfUnits || 0,
          completedUnits: task.completedUnits || 0,
          priorityCode: task.priority || 1, // Store the numerical priority code
          timeframe: task.timeframe || "day", // Default to day if not specified
        };

        // Add task to appropriate timeframe group
        if (task.timeframe === "day") {
          groupedTasks.day.push(transformedTask);
        } else if (task.timeframe === "week") {
          groupedTasks.week.push(transformedTask);
        } else if (task.timeframe === "month") {
          groupedTasks.month.push(transformedTask);
        } else {
          // Default to day if timeframe is not specified
          groupedTasks.day.push(transformedTask);
        }
      });

      setTasks(groupedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setError(error.message);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert priority code to matrix container label
  const getPriorityFromCode = (priorityCode) => {
    if (!priorityCode) return null;

    // Extract the first digit of the priority code
    const priorityFirstDigit = Math.floor(parseInt(priorityCode) / 100);

    switch (priorityFirstDigit) {
      case 5:
        return "urgent";
      case 4:
        return "high";
      case 3:
        return "medium";
      case 2:
        return "low";
      default:
        return null; // Unassigned or invalid
    }
  };

  // Helper function to calculate progress percentage
  const calculateProgress = (completed, total) => {
    if (!total) return 0;
    return Math.round((completed / total) * 100);
  };

  // Initialize by fetching tasks
  useEffect(() => {
    fetchTasks();
  }, []);

  // Function to cycle through timeframes
  const handleTimeframeChange = (direction) => {
    const timeframes = ["day", "week", "month"];
    const currentIndex = timeframes.indexOf(activeTimeframe);

    if (direction === "next") {
      setActiveTimeframe(timeframes[(currentIndex + 1) % timeframes.length]);
    } else {
      setActiveTimeframe(timeframes[(currentIndex - 1 + timeframes.length) % timeframes.length]);
    }
  };

  // Task handlers

  // Drag and drop handlers
  const handleDragStart = (taskId) => {
    setDraggedTask(taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (priority) => {
    if (draggedTask) {
      const updatedTasks = { ...tasks };
      const originalPriority = updatedTasks[activeTimeframe].find(
        (task) => task.id === draggedTask
      )?.priority;

      updatedTasks[activeTimeframe] = updatedTasks[activeTimeframe].map((task) => {
        if (task.id === draggedTask) {
          return { ...task, priority };
        }
        return task;
      });

      setTasks(updatedTasks);
      setDraggedTask(null);

      const taskName = updatedTasks[activeTimeframe].find((task) => task.id === draggedTask)?.name;
      const priorityName = priority ? priorities[priority].title : "Unassigned";
    }
  };

  // Calculate priority code (ABC format) for each task
  const calculatePriorityCode = () => {
    const currentTasks = tasks[activeTimeframe];

    // Step 1: Assign matrix priority (A)
    const tasksWithMatrixPriority = currentTasks.map((task) => {
      // Map priority to 5-1 values (5=urgent, 4=high, 3=medium, 2=low, 1=unassigned)
      let matrixValue = 1; // Default for unassigned
      if (task.priority) {
        switch (task.priority) {
          case "urgent":
            matrixValue = 5;
            break;
          case "high":
            matrixValue = 4;
            break;
          case "medium":
            matrixValue = 3;
            break;
          case "low":
            matrixValue = 2;
            break;
          default:
            matrixValue = 1;
        }
      }
      return { ...task, matrixValue };
    });

    // Rest of the function remains the same
    // Step 2: Sort by remaining time (for B value)
    const sortedByTime = [...tasksWithMatrixPriority].sort((a, b) => {
      // If endDate is available, sort by it
      if (a.endDate && b.endDate) {
        return new Date(a.endDate) - new Date(b.endDate);
      }
      // Fall back to time value if no end date
      return a.time - b.time;
    });

    // Assign ranks (1-9 max)
    const timeRanks = {};
    const maxTimeRank = Math.min(9, sortedByTime.length);

    sortedByTime.forEach((task, index) => {
      // Map to 1-9 range, with lowest time getting highest rank
      if (index < maxTimeRank) {
        timeRanks[task.id] = maxTimeRank - index;
      } else {
        timeRanks[task.id] = 1; // All remaining tasks get a 1
      }
    });

    // Add the timeRank to each task
    const tasksWithTimeRank = tasksWithMatrixPriority.map((task) => ({
      ...task,
      timeRank: timeRanks[task.id] || 1,
    }));

    // Step 3: Sort by remaining units (for C value)
    // Calculate remaining units for each task
    const tasksWithRemaining = tasksWithTimeRank.map((task) => ({
      ...task,
      remainingUnits: task.numberOfUnits - task.completedUnits,
    }));

    // Sort by remaining units (descending order)
    const sortedByUnits = [...tasksWithRemaining].sort(
      (a, b) => b.remainingUnits - a.remainingUnits
    );

    // Assign ranks (1-9 max)
    const unitRanks = {};
    const maxUnitRank = Math.min(9, sortedByUnits.length);

    sortedByUnits.forEach((task, index) => {
      // Map to 1-9 range, with fewest remaining units getting highest rank
      if (index < maxUnitRank) {
        unitRanks[task.id] = maxUnitRank - index;
      } else {
        unitRanks[task.id] = 1; // All remaining tasks get a 1
      }
    });

    // Step 4: Combine to form the ABC priority code as a number
    return tasksWithRemaining.map((task) => {
      // Calculate the numerical priority code
      const priorityCode = task.matrixValue * 100 + task.timeRank * 10 + (unitRanks[task.id] || 1);

      return {
        ...task,
        priorityCode: priorityCode, // Store as a number, not a string
      };
    });
  }; // Handle "Create Matrix" button click
  const handleCreateMatrix = async () => {
    setLoading(true);
    setError(null);

    try {
      // Calculate priority codes for the current timeframe
      const tasksWithPriority = calculatePriorityCode();

      // Map numerical priority code to matrix containers before updating state
      const tasksWithMatrixContainer = tasksWithPriority.map((task) => {
        const priorityFirstDigit = Math.floor(task.priorityCode / 100);

        // Map the first digit to matrix container
        let matrixPriority = null;
        switch (priorityFirstDigit) {
          case 5:
            matrixPriority = "urgent";
            break;
          case 4:
            matrixPriority = "high";
            break;
          case 3:
            matrixPriority = "medium";
            break;
          case 2:
            matrixPriority = "low";
            break;
          default:
            matrixPriority = null; // Unassigned (1) or invalid
        }

        return {
          ...task,
          priority: matrixPriority, // Update the matrix container
        };
      });

      // Update tasks state for the current timeframe
      setTasks((prevTasks) => ({
        ...prevTasks,
        [activeTimeframe]: tasksWithMatrixContainer,
      }));

      // Get token for API calls
      const token = localStorage.getItem("jwtToken");

      // Update priorities in the API
      const updatePromises = tasksWithMatrixContainer.map((task) =>
        updateTaskPriority(token, task.id, task.priorityCode)
      );

      // Wait for all updates to complete
      const results = await Promise.all(updatePromises);

      // Check for errors
      const errors = results.filter((result) => result.success === false);
      if (errors.length > 0) {
        throw new Error(`Failed to update ${errors.length} tasks: ${errors[0].error}`);
      }

      // Success notification
      toast.success(
        `${
          activeTimeframe.charAt(0).toUpperCase() + activeTimeframe.slice(1)
        } Matrix created successfully`
      );
      console.log("All task priorities updated successfully");
    } catch (error) {
      console.error("Error updating priorities:", error);
      setError(error.message);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Filter tasks by priority for the current timeframe
  const getTasksByPriority = (priority) => {
    return tasks[activeTimeframe].filter((task) => task.priority === priority);
  };

  const getUnassignedTasks = () => {
    return tasks[activeTimeframe].filter((task) => task.priority === null);
  };

  // Render a task card
  const renderTaskCard = (task) => (
    <div
      key={task.id}
      className={`task-card ${draggedTask === task.id ? "dragging" : ""}`}
      draggable
      onDragStart={() => handleDragStart(task.id)}
    >
      <div className="task-header">
        <div className="drag-handle">
          <GripVertical size={16} color="#9ca3af" />
        </div>
        <h3 className="task-title">{task.name}</h3>
        <button className="three-dots-menu">
          <MoreVertical size={16} />
        </button>
      </div>

      <div className="task-details">
        <div className="task-time">{task.time} min</div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${task.progress}%` }} />
        </div>
        <div className="progress-text">{task.progress}% complete</div>
        {task.priorityCode && <div className="priority-code">Priority: {task.priorityCode}</div>}
      </div>
    </div>
  );

  return (
    <div className="priority-matrix-container">
      {/* Add the Toaster component */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
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
      <h1 className="title">Priority Matrix</h1>
      {/* Timeframe Selector */}
      <div className="timeframe-selector">
        <button className="timeframe-arrow" onClick={() => handleTimeframeChange("prev")}>
          <ChevronLeft size={20} />
        </button>

        <div className="timeframe-display">
          <span className={`timeframe-option ${activeTimeframe === "day" ? "active" : ""}`}>
            Day
          </span>
          <span className={`timeframe-option ${activeTimeframe === "week" ? "active" : ""}`}>
            Week
          </span>
          <span className={`timeframe-option ${activeTimeframe === "month" ? "active" : ""}`}>
            Month
          </span>
        </div>

        <button className="timeframe-arrow" onClick={() => handleTimeframeChange("next")}>
          <ChevronRight size={20} />
        </button>
      </div>
      {/* Error message */}
      {error && <div className="error-message">{error}</div>}
      {/* Task Container Section */}
      <div className="task-container" onDragOver={handleDragOver} onDrop={() => handleDrop(null)}>
        <div className="task-container-header">
          <h2 className="task-container-title">
            Available Tasks ({activeTimeframe}){" "}
            <span className="task-count">({getUnassignedTasks().length} tasks)</span>
          </h2>
        </div>

        {/* Task Form */}

        {/* Task List (Unassigned Tasks) */}
        <div className="tasks-wrapper">
          {loading && <div className="loading">Loading tasks...</div>}
          {!loading && getUnassignedTasks().length === 0 && (
            <div className="no-tasks">0 tasks in {activeTimeframe} </div>
          )}
          {!loading && getUnassignedTasks().map(renderTaskCard)}
        </div>
      </div>
      {/* Priority Quadrants Section */}
      <div className="matrix-grid">
        {Object.keys(priorities).map((priority) => (
          <div
            key={priority}
            className={`priority-quadrant ${priority}`}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(priority)}
          >
            <h2 className="quadrant-header">
              {priorities[priority].title}
              <span className="task-count">({getTasksByPriority(priority).length} tasks)</span>
            </h2>

            <div className="task-list">
              {getTasksByPriority(priority).length === 0 ? (
                <div className="no-tasks">
                  0 {priorities[priority].title.toLowerCase()} tasks for {activeTimeframe}
                </div>
              ) : (
                getTasksByPriority(priority).map(renderTaskCard)
              )}
            </div>
          </div>
        ))}
      </div>
      <br /> <br />
      <button className="create-matrix-button" onClick={handleCreateMatrix} disabled={loading}>
        <PlusCircle size={20} />
        <span>
          {loading
            ? "Processing..."
            : `Create ${activeTimeframe.charAt(0).toUpperCase() + activeTimeframe.slice(1)} Matrix`}
        </span>
      </button>{" "}
    </div>
  );
};

export default PriorityMatrix;
