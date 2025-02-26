import React, { useState, useEffect } from "react";
import { GripVertical, MoreVertical, Plus, PlusCircle } from "lucide-react";
import "./PriorityMatrix.css";
import { getTasks, updateTaskPriority } from "../../../api/api"; // Import the API functions

const PriorityMatrix = () => {
  const priorities = {
    urgent: { title: "Urgent", color: "#dc2626", bgColor: "#fef2f2", value: 1 },
    high: { title: "High", color: "#ea580c", bgColor: "#fff7ed", value: 2 },
    medium: { title: "Medium", color: "#2563eb", bgColor: "#eff6ff", value: 3 },
    low: { title: "Low", color: "#16a34a", bgColor: "#f0fdf4", value: 4 },
  };

  // State for tasks
  const [tasks, setTasks] = useState([]);
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
  });
  const [draggedTask, setDraggedTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch tasks from API
  // Fetch tasks from API and map them to the correct matrix container
  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("jwtToken"); // Assuming token is stored in localStorage
      const response = await getTasks(token);
      console.log(response);
      if (response.success === false) {
        throw new Error(response.error || "Failed to fetch tasks");
      }

      // Transform API tasks to include necessary fields
      const transformedTasks = response.tasks.map((task) => {
        // Extract the priority from the priorityCode (first digit of the number)
        let matrixPriority = null;
        if (task.priority !== undefined) {
          // If priority is stored as a number, extract the first digit
          const priorityFirstDigit = Math.floor(parseInt(task.priority) / 100);

          // Map the first digit back to matrix container
          switch (priorityFirstDigit) {
            case 4:
              matrixPriority = "urgent";
              break;
            case 3:
              matrixPriority = "high";
              break;
            case 2:
              matrixPriority = "medium";
              break;
            case 1:
              matrixPriority = "low";
              break;
            default:
              matrixPriority = null; // Unassigned (0) or invalid
          }
        }

        return {
          id: task._id || task.id,
          name: task.name || task.title,
          time: task.estimatedTime || 0,
          progress: calculateProgress(task.completedUnits, task.numberOfUnits),
          priority: matrixPriority, // Set the priority based on the priorityCode
          endDate: task.endDate || null,
          numberOfUnits: task.numberOfUnits || 0,
          completedUnits: task.completedUnits || 0,
          priorityCode: task.priority || 0, // Store the numerical priority code
        };
      });

      setTasks(transformedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setError(error.message);
    } finally {
      setLoading(false);
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

  // Task handlers
  const handleAddTask = () => {
    setNewTask({
      id: `task-${Date.now()}`,
      name: "",
      time: "",
      progress: 0,
      priority: null,
      endDate: null,
      numberOfUnits: 0,
      completedUnits: 0,
      priorityCode: "",
    });
    setShowTaskForm(true);
  };

  const handleTaskChange = (e) => {
    const { name, value } = e.target;
    setNewTask({
      ...newTask,
      [name]:
        name === "progress" ||
        name === "time" ||
        name === "numberOfUnits" ||
        name === "completedUnits"
          ? parseInt(value, 10) || 0
          : value,
    });
  };

  const handleTaskSubmit = (e) => {
    e.preventDefault();
    const progress = calculateProgress(newTask.completedUnits, newTask.numberOfUnits);

    setTasks([
      ...tasks,
      {
        ...newTask,
        progress,
      },
    ]);

    setShowTaskForm(false);
    setNewTask({
      id: "",
      name: "",
      time: "",
      progress: 0,
      priority: null,
      endDate: null,
      numberOfUnits: 0,
      completedUnits: 0,
      priorityCode: "",
    });
  };

  const handleCancelTask = () => {
    setShowTaskForm(false);
  };

  // Drag and drop handlers
  const handleDragStart = (taskId) => {
    setDraggedTask(taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (priority) => {
    if (draggedTask) {
      const updatedTasks = tasks.map((task) => {
        if (task.id === draggedTask) {
          return { ...task, priority };
        }
        return task;
      });
      setTasks(updatedTasks);
      setDraggedTask(null);
    }
  };

  // Calculate priority code (ABC format) for each task
  // Calculate priority code (ABC format) for each task
  // Calculate priority code (ABC format) for each task
  const calculatePriorityCode = () => {
    // Step 1: Assign matrix priority (A)
    const tasksWithMatrixPriority = tasks.map((task) => {
      // Map priority to 4-0 values (4=urgent, 3=high, 2=medium, 1=low, 0=unassigned)
      let matrixValue = 0; // Default for unassigned
      if (task.priority) {
        switch (task.priority) {
          case "urgent":
            matrixValue = 4;
            break;
          case "high":
            matrixValue = 3;
            break;
          case "medium":
            matrixValue = 2;
            break;
          case "low":
            matrixValue = 1;
            break;
          default:
            matrixValue = 0;
        }
      }
      return { ...task, matrixValue };
    });

    // Step 2: Sort by remaining time (for B value)
    // First, sort tasks by time (or endDate if available)
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
  };

  // Handle "Create Matrix" button click
  // Handle "Create Matrix" button click
  const handleCreateMatrix = async () => {
    setLoading(true);
    setError(null);

    try {
      // Calculate priority codes
      const tasksWithPriority = calculatePriorityCode();

      // Map numerical priority code to matrix containers before updating state
      const tasksWithMatrixContainer = tasksWithPriority.map((task) => {
        const priorityFirstDigit = Math.floor(task.priorityCode / 100);

        // Map the first digit to matrix container
        let matrixPriority = null;
        switch (priorityFirstDigit) {
          case 4:
            matrixPriority = "urgent";
            break;
          case 3:
            matrixPriority = "high";
            break;
          case 2:
            matrixPriority = "medium";
            break;
          case 1:
            matrixPriority = "low";
            break;
          default:
            matrixPriority = null; // Unassigned (0) or invalid
        }

        return {
          ...task,
          priority: matrixPriority, // Update the matrix container
        };
      });

      // Update tasks state locally first with correct matrix container assignments
      setTasks(tasksWithMatrixContainer);

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

      // Success notification or action
      console.log("All task priorities updated successfully");
    } catch (error) {
      console.error("Error updating priorities:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter tasks by priority
  const getTasksByPriority = (priority) => {
    return tasks.filter((task) => task.priority === priority);
  };

  const getUnassignedTasks = () => {
    return tasks.filter((task) => task.priority === null);
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
      <h1 className="title">Priority Matrix</h1>
      {/* Error message */}
      {error && <div className="error-message">{error}</div>}
      {/* Task Container Section */}
      <div className="task-container" onDragOver={handleDragOver} onDrop={() => handleDrop(null)}>
        <div className="task-container-header">
          <h2 className="task-container-title">
            Available Tasks{" "}
            <span className="task-count">({getUnassignedTasks().length} tasks)</span>
          </h2>
          <button className="add-task-btn" onClick={handleAddTask}>
            <Plus size={16} />
          </button>
        </div>

        {/* Task Form */}
        {showTaskForm && (
          <form className="task-form" onSubmit={handleTaskSubmit}>
            <input
              type="text"
              name="name"
              value={newTask.name}
              onChange={handleTaskChange}
              placeholder="Task name"
              required
            />
            <input
              type="number"
              name="time"
              value={newTask.time}
              onChange={handleTaskChange}
              placeholder="Time (minutes)"
              min="1"
              required
            />
            <input
              type="date"
              name="endDate"
              value={newTask.endDate || ""}
              onChange={handleTaskChange}
              placeholder="End Date"
            />
            <input
              type="number"
              name="numberOfUnits"
              value={newTask.numberOfUnits}
              onChange={handleTaskChange}
              placeholder="Total Units"
              min="0"
              required
            />
            <input
              type="number"
              name="completedUnits"
              value={newTask.completedUnits}
              onChange={handleTaskChange}
              placeholder="Completed Units"
              min="0"
              max={newTask.numberOfUnits}
              required
            />
            <div className="form-actions">
              <button type="submit">Save</button>
              <button type="button" onClick={handleCancelTask}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Task List (Unassigned Tasks) */}
        <div className="tasks-wrapper">
          {loading && <div className="loading">Loading tasks...</div>}
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

            <div className="task-list">{getTasksByPriority(priority).map(renderTaskCard)}</div>
          </div>
        ))}
      </div>{" "}
      <br></br>
      <button className="create-matrix-button" onClick={handleCreateMatrix} disabled={loading}>
        <PlusCircle size={20} />
        <span>{loading ? "Processing..." : "Create Matrix"}</span>
      </button>
    </div>
  );
};

export default PriorityMatrix;
