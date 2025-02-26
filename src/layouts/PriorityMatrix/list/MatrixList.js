import React, { useState, useEffect } from "react";
import { PlusCircle, ChevronRight } from "lucide-react";
import "./MatrixList.css";
import { getTasks } from "../../../api/api"; // Import the API function

const MatrixList = () => {
  const [expandedItem, setExpandedItem] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch tasks from API
  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("jwtToken"); // Assuming token is stored in localStorage
      const response = await getTasks(token);

      if (response.success === false) {
        throw new Error(response.error || "Failed to fetch tasks");
      }

      // Transform API tasks to include necessary fields
      const transformedTasks = response.tasks.map((task) => ({
        id: task._id || task.id,
        name: task.taskName,
        date: new Date(task.createdAt || task.endDate || Date.now()).toLocaleDateString("et-EE", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        title: task.name || task.title,
        details: `Time: ${task.estimatedTime || 0} minutes | Progress: ${calculateProgress(
          task.completedUnits,
          task.numberOfUnits
        )}% | Units: ${task.completedUnits || 0}/${task.numberOfUnits || 0}`,
        priority: task.priority || 0, // Numerical priority code
      }));

      // Sort tasks by priority in descending order (highest priority first)
      const sortedTasks = transformedTasks.sort((a, b) => b.priority - a.priority);

      setTasks(sortedTasks);
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

  const toggleExpand = (id) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  // Format the priority for display
  const formatPriority = (priority) => {
    if (!priority) return "Unassigned";

    const firstDigit = Math.floor(priority / 100);
    let priorityText = "";

    switch (firstDigit) {
      case 4:
        priorityText = "Urgent";
        break;
      case 3:
        priorityText = "High";
        break;
      case 2:
        priorityText = "Medium";
        break;
      case 1:
        priorityText = "Low";
        break;
      default:
        priorityText = "Unassigned";
    }

    return `${priorityText} (${priority})`;
  };

  return (
    <div className="matrix-container">
      <h1 className="matrix-title">Tasks by Priority</h1>

      {loading && <div className="loading-message">Loading tasks...</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="matrix-list">
        {tasks.length === 0 && !loading ? (
          <div className="no-tasks-message">No tasks available</div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="matrix-item">
              <div className="matrix-item-header" onClick={() => toggleExpand(task.id)}>
                <div className="matrix-item-content">
                  <div className="matrix-item-date">{task.date}</div>
                  <div className="matrix-item-priority">{task.name} </div>
                  <h3 className="matrix-item-title">{task.title}</h3>
                </div>
                <div className={`matrix-item-icon ${expandedItem === task.id ? "rotated" : ""}`}>
                  <ChevronRight />
                  {console.log(task)}
                </div>
              </div>

              <div className={`matrix-item-details ${expandedItem === task.id ? "expanded" : ""}`}>
                <p>{task.details}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <button className="refresh-button" onClick={fetchTasks} disabled={loading}>
        <PlusCircle size={20} />
        <span>{loading ? "Loading..." : "Refresh Tasks"}</span>
      </button>
    </div>
  );
};

export default MatrixList;
