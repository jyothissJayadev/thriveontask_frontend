import React, { useState, useEffect } from "react";
import { GripVertical, MoreVertical, Plus, PlusCircle } from "lucide-react";
import "./PriorityMatrix.css";

const PriorityMatrix = () => {
  const priorities = {
    urgent: { title: "Urgent", color: "#dc2626", bgColor: "#fef2f2" },
    high: { title: "High", color: "#ea580c", bgColor: "#fff7ed" },
    medium: { title: "Medium", color: "#2563eb", bgColor: "#eff6ff" },
    low: { title: "Low", color: "#16a34a", bgColor: "#f0fdf4" },
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
  });
  const [draggedTask, setDraggedTask] = useState(null);

  // Initialize with 10 tasks
  useEffect(() => {
    const initialTasks = Array.from({ length: 10 }, (_, i) => ({
      id: `task-${i + 1}`,
      name: `Task ${i + 1}`,
      time: Math.floor(Math.random() * 60) + 15, // Random time between 15-75 minutes
      progress: Math.floor(Math.random() * 100), // Random progress
      priority: null, // All start in parent container
    }));
    setTasks(initialTasks);
  }, []);

  // Task handlers
  const handleAddTask = () => {
    setNewTask({
      id: `task-${Date.now()}`,
      name: "",
      time: "",
      progress: 0,
      priority: null,
    });
    setShowTaskForm(true);
  };

  const handleTaskChange = (e) => {
    const { name, value } = e.target;
    setNewTask({
      ...newTask,
      [name]: name === "progress" || name === "time" ? parseInt(value, 10) || 0 : value,
    });
  };

  const handleTaskSubmit = (e) => {
    e.preventDefault();
    setTasks([...tasks, newTask]);
    setShowTaskForm(false);
    setNewTask({
      id: "",
      name: "",
      time: "",
      progress: 0,
      priority: null,
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
      </div>
    </div>
  );

  return (
    <div className="priority-matrix-container">
      <h1 className="title">Priority Matrix</h1>
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
              type="number"
              name="progress"
              value={newTask.progress}
              onChange={handleTaskChange}
              placeholder="Progress (%)"
              min="0"
              max="100"
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
        <div className="tasks-wrapper">{getUnassignedTasks().map(renderTaskCard)}</div>
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
      <button className="create-matrix-button">
        <PlusCircle size={20} />
        <span>Create Matrix</span>
      </button>
    </div>
  );
};

export default PriorityMatrix;
