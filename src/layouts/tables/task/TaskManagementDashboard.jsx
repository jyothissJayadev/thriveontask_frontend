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

  const fetchTasks = async () => {
    try {
      const data = await getTasks(token); // Assuming getTasks is your API call
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
          } = task;
          const completion = (completedUnits / numberOfUnits) * 100;

          const taskObject = {
            id: String(task._id),
            name: taskName,
            completion: completedUnits,
            remaining: calculateRemainingTime(task.endDate),
            startTime: createdAt,
            endDate: endDate,
            updatedAt: updatedAt,
            numberOfUnits: numberOfUnits,
          };

          if (timeframe === "day") {
            groupedTasks.day.push(taskObject);
          } else if (timeframe === "week") {
            groupedTasks.week.push(taskObject);
          } else if (timeframe === "month") {
            groupedTasks.month.push(taskObject);
          }
        });

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
      };

      setTasks((prevState) => ({
        ...prevState,
        [taskData.timeframe]: [...prevState[taskData.timeframe], newTask],
      }));

      const response = await createTask(
        taskData.name,
        0, // Assuming completedUnits starts at 0
        0, // Assuming numberOfUnits starts at 0
        taskData.endDate,
        taskData.timeframe,
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
    <div onClick={() => onClick(task)} className="task-cube">
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
    }).isRequired,
    onClick: PropTypes.func.isRequired,
  };

  const SectionContainer = ({ title, tasks, onTaskClick }) => {
    const [page, setPage] = useState(0);
    const itemsPerPage = 5;
    const totalPages = Math.ceil(tasks.length / itemsPerPage);

    const visibleTasks = useMemo(() => {
      const start = page * itemsPerPage;
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
    setActiveModal(task);
  }, []);

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
      <TaskModal
        task={typeof activeModal === "object" ? activeModal : null}
        onClose={() => {
          setActiveModal(null);
          window.location.reload();
        }}
      />
      <AddTaskModal
        timeframe={addTaskTimeframe}
        onClose={() => {
          setAddTaskTimeframe(null);
          setActiveModal(null);
        }}
      />
    </div>
  );
};

export default TaskManagementDashboard;
