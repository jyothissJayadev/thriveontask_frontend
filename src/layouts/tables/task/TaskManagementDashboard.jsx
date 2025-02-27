import React, { useEffect, useState, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { FiPlus, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import TaskUpdator from "../IndividualTask/TaskUpdator";
import "./TaskManagementDashboard.css";
import MDBox from "components/MDBox";
import TaskAdditionForm from "../AddTask/TaskAdditionForm";
import { getTasks, createTask } from "api/api"; // Importing API functions

const TaskManagementDashboard = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [addTaskTimeframe, setAddTaskTimeframe] = useState(null);
  const token = localStorage.getItem("jwtToken");
  const [tasks, setTasks] = useState({
    day: [],
    week: [],
    month: [],
  });

  // First, update your fetchTasks function to store priority in the taskObject
  const fetchTasks = async () => {
    try {
      const data = await getTasks(token);
      if (data.success) {
        const groupedTasks = {
          day: [],
          week: [],
          month: [],
        };

        data.tasks.forEach((task) => {
          const {
            taskName,
            completedUnits,
            numberOfUnits,
            timeframe,
            createdAt,
            endDate,
            updatedAt,
            priority, // Make sure the API returns this field
          } = task;
          const completion = (completedUnits / numberOfUnits) * 100;

          const taskObject = {
            id: String(task._id),
            name: taskName,
            completion: completion,
            remaining: calculateRemainingTime(task.endDate),
            startTime: createdAt,
            endDate: endDate,
            updatedAt: updatedAt,
            numberOfUnits: numberOfUnits,
            priority: priority, // Store the priority in taskObject
          };

          if (timeframe === "day") {
            groupedTasks.day.push(taskObject);
          } else if (timeframe === "week") {
            groupedTasks.week.push(taskObject);
          } else if (timeframe === "month") {
            groupedTasks.month.push(taskObject);
          }
        });

        // Sort tasks by priority before setting state
        for (const timeframe in groupedTasks) {
          groupedTasks[timeframe].sort((a, b) => b.priority - a.priority); // Higher priority first
        }

        setTasks(groupedTasks);
      } else {
        console.error("Error fetching tasks:", data.error);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const calculateRemainingTime = (endDate) => {
    const currentTime = new Date();
    const endTime = new Date(endDate);
    const timeDifference = endTime - currentTime;

    if (timeDifference < 0) {
      return "0h";
    }

    const hoursRemaining = Math.floor(timeDifference / (1000 * 60 * 60));
    const daysRemaining = Math.floor(hoursRemaining / 24);

    if (daysRemaining > 0) {
      return `${daysRemaining}d`;
    } else {
      return `${hoursRemaining}h`;
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [token]);

  const addTask = async (taskData) => {
    try {
      const newTask = {
        id: Math.random(),
        name: taskData.name,
        completion: 0,
        remaining: "Not started",
        priority: taskData.priority || 0, // Assuming priority is part of taskData now
      };

      setTasks((prevState) => {
        const updatedTasks = {
          ...prevState,
          [taskData.timeframe]: [...prevState[taskData.timeframe], newTask],
        };

        // Re-sort the tasks after adding the new one
        updatedTasks[taskData.timeframe].sort((a, b) => b.priority - a.priority);

        return updatedTasks;
      });

      const response = await createTask(
        taskData.name,
        0,
        0,
        taskData.endDate,
        taskData.timeframe,
        taskData.priority, // Make sure to pass priority to API
        token
      );

      if (response.success) {
        console.log("Task added successfully!");
      } else {
        console.error("Error adding task:", response.error);
      }
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };
  const AddTaskModal = ({ timeframe, onClose }) => {
    if (!timeframe) return null;

    return (
      <div className="add-task-modal-overlay" onClick={onClose}>
        <div className="add-task-modal" onClick={(e) => e.stopPropagation()}>
          <TaskAdditionForm onClose={onClose} timeframe={timeframe} onSubmitTask={addTask} />
        </div>
      </div>
    );
  };

  AddTaskModal.propTypes = {
    timeframe: PropTypes.string,
    onClose: PropTypes.func.isRequired,
  };

  const TaskCube = ({ task, onClick }) => (
    <div
      onClick={() => onClick(task)}
      className={`task-cube ${task.priority === 0 ? "task-completed" : ""}`}
    >
      <h3 className="task-title">{task.name}</h3>
      <div className="progress-container">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${task.completion}%` }} />
        </div>
        <p className="remaining-time">{task.remaining} remaining</p>
      </div>
    </div>
  );

  TaskCube.propTypes = {
    task: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      completion: PropTypes.string.isRequired,
      remaining: PropTypes.string.isRequired,
      priority: PropTypes.number,
    }).isRequired,
    onClick: PropTypes.func.isRequired,
  };

  const SectionContainer = ({ title, tasks, onTaskClick }) => {
    const [page, setPage] = useState(0);
    const itemsPerPage = 5;
    const totalPages = Math.ceil(tasks.length / itemsPerPage);

    const visibleTasks = useMemo(() => {
      const start = page * itemsPerPage;
      // Tasks are already sorted by priority from the fetchTasks function
      return tasks.slice(start, start + itemsPerPage);
    }, [tasks, page]);
    const getTimeframeFromTitle = (title) => {
      if (title === "Today") return "day";
      if (title === "This Week") return "week";
      if (title === "This Month") return "month";
      return "";
    };

    return (
      <MDBox
        position="relative"
        minHeight="18.75rem"
        borderRadius="xl"
        padding="50px"
        bgColor="#141826"
        sx={{
          color: "white",
          opacity: 1,
          textAlign: "center",
        }}
      >
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">{title}</h2>
            {totalPages > 1 && (
              <div className="pagination-controls">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="pagination-button"
                >
                  <FiChevronLeft className="pagination-icon" />
                </button>
                <span className="pagination-text">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  className="pagination-button"
                >
                  <FiChevronRight className="pagination-icon" />
                </button>
              </div>
            )}
          </div>
          <div className="tasks-grid">
            {visibleTasks.map((task) => (
              <TaskCube key={task.id} task={task} onClick={onTaskClick} />
            ))}
            <button
              onClick={() => {
                setAddTaskTimeframe(getTimeframeFromTitle(title));
                setActiveModal("add");
              }}
              className="add-task-button"
            >
              <FiPlus className="add-task-icon" />
            </button>
          </div>
        </div>
      </MDBox>
    );
  };

  SectionContainer.propTypes = {
    title: PropTypes.string.isRequired,
    tasks: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        completion: PropTypes.string.isRequired,
        remaining: PropTypes.string.isRequired,
      })
    ).isRequired,
    onTaskClick: PropTypes.func.isRequired,
  };

  const TaskModal = ({ task, onClose }) => {
    if (!task) return null;

    return (
      <div className="modal-overlay">
        <TaskUpdator task={task} onClose={onClose} />
      </div>
    );
  };

  TaskModal.propTypes = {
    task: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      completion: PropTypes.string.isRequired,
      remaining: PropTypes.string.isRequired,
    }),
    onClose: PropTypes.func.isRequired,
  };

  const handleTaskClick = useCallback((task) => {
    // Navigate to the task updator route with the task id
    window.location.href = `/task/${task.id}`;
  }, []);
  const TimeframeFilter = () => {
    const [activeTimeframe, setActiveTimeframe] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");

    const handleDeleteClick = (timeframe) => {
      setActiveTimeframe(timeframe);
      setShowConfirm(true);
    };

    const confirmDelete = () => {
      setShowConfirm(false);
      setAlertMessage(
        `${activeTimeframe.charAt(0).toUpperCase() + activeTimeframe.slice(1)} is clicked.`
      );
      setShowAlert(true);

      // Here you would add the actual delete logic
      console.log(`Deleting all tasks in timeframe: ${activeTimeframe}`);

      // Reset active timeframe
      setActiveTimeframe(null);
    };

    const cancelDelete = () => {
      setShowConfirm(false);
      setActiveTimeframe(null);
    };

    return (
      <div className="timeframe-filter">
        <h3>Delete by Timeframe:</h3>
        <div className="filter-buttons">
          {["all", "day", "week", "month"].map((timeframe) => (
            <button
              key={timeframe}
              className={`filter-button ${activeTimeframe === timeframe ? "active" : ""}`}
              onClick={() => handleDeleteClick(timeframe)}
            >
              {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
            </button>
          ))}
        </div>

        {/* Confirmation Dialog */}
        {showConfirm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Confirm Delete</h3>
              <p>Are you sure you want to delete all tasks in {activeTimeframe}?</p>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
                <button
                  onClick={cancelDelete}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "0.375rem",
                    border: "1px solid var(--gray-300)",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "0.375rem",
                    backgroundColor: "#ef4444",
                    color: "white",
                    border: "none",
                  }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Alert Message */}
        {showAlert && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Alert</h3>
              <p>{alertMessage}</p>
              <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
                <button
                  onClick={() => setShowAlert(false)}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "0.375rem",
                    backgroundColor: "var(--primary-blue)",
                    color: "white",
                    border: "none",
                  }}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <h1 className="dashboard-title">Task Management Dashboard</h1>

        <div className="grid-container">
          <SectionContainer title="Today" tasks={tasks.day} onTaskClick={handleTaskClick} />
          <SectionContainer title="This Week" tasks={tasks.week} onTaskClick={handleTaskClick} />
        </div>

        <div>
          <SectionContainer title="This Month" tasks={tasks.month} onTaskClick={handleTaskClick} />
        </div>
      </div>
      <AddTaskModal
        timeframe={addTaskTimeframe}
        onClose={() => {
          setAddTaskTimeframe(null);
          setActiveModal(null);
        }}
      />{" "}
      <TimeframeFilter />
    </div>
  );
};

export default TaskManagementDashboard;
