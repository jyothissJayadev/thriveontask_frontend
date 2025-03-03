import React, { useState, useEffect } from "react";
import "./TaskList.css";
import { Card, Icon } from "@mui/material";
import PropTypes from "prop-types";
// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

const TaskList = ({ tasks, Title }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showProgressBar, setShowProgressBar] = useState(true);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  const [animatedRows, setAnimatedRows] = useState([]);

  const tasksPerPage = 5;

  // Filter out tasks with priority = 0
  const filteredTasks = tasks.filter((task) => task.priority !== 0);
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);

  // Get progress bar color based on completion percentage
  const getProgressColor = (percentage) => {
    if (percentage < 25) {
      return "#b32424"; // Darker Red for low completion
    } else if (percentage < 50) {
      return "#cc7a29"; // Darker Orange for getting started
    } else if (percentage < 75) {
      return "#cccc29"; // Darker Yellow for halfway
    } else if (percentage < 90) {
      return "#29cc29"; // Darker Green for good progress
    } else {
      return "#009900"; // Darker Green for near completion
    }
  };

  // Format time remaining in minutes or hours
  const formatTimeRemaining = (createdAt, endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const timeLeftMs = end - now;

    // If time is negative, show as negative time
    if (timeLeftMs < 0) {
      const absTimeLeftMs = Math.abs(timeLeftMs);
      if (absTimeLeftMs < 3600000) {
        // Less than 1 hour
        return `-${Math.ceil(absTimeLeftMs / 60000)} mins`;
      } else {
        return `-${Math.ceil(absTimeLeftMs / 3600000)} hours`;
      }
    } else {
      // Positive time remaining
      if (timeLeftMs < 3600000) {
        // Less than 1 hour
        return `${Math.ceil(timeLeftMs / 60000)} mins`;
      } else {
        return `${Math.ceil(timeLeftMs / 3600000)} hours`;
      }
    }
  };

  // Format last updated time
  const formatLastUpdated = (updatedAt) => {
    const now = new Date();
    const updated = new Date(updatedAt);
    const timeDiffMs = now - updated;

    if (timeDiffMs < 3600000) {
      // Less than 1 hour
      return `${Math.floor(timeDiffMs / 60000)} mins ago`;
    } else if (timeDiffMs < 86400000) {
      // Less than 24 hours
      return `${Math.floor(timeDiffMs / 3600000)} hours ago`;
    } else {
      return `${Math.floor(timeDiffMs / 86400000)} days ago`;
    }
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setShowProgressBar(window.innerWidth > 380);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Animation effect when tasks change
  useEffect(() => {
    setAnimatedRows([]);
    setTimeout(() => {
      const taskIds = currentTasks.map((task, index) => index);
      setAnimatedRows(taskIds);
    }, 100);
  }, [currentPage, tasks, Title]);

  // Handle pagination
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      setAnimatedRows([]); // Reset animations
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setAnimatedRows([]); // Reset animations
    }
  };

  // Sorting function based on Title
  // Sorting function based on Title
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (Title === "Lesser Time Left") {
      const now = new Date();
      const timeLeftA = new Date(a.endDate) - now;
      const timeLeftB = new Date(b.endDate) - now;
      return timeLeftA - timeLeftB; // Sort by time remaining (ascending)
    } else if (Title === "Not Seen for Long Time") {
      // Changed sorting logic: oldest updated first (ascending order of dates)
      return new Date(a.updatedAt) - new Date(b.updatedAt);
    } else {
      const unitsLeftA = a.numberOfUnits - a.completedUnits;
      const unitsLeftB = b.numberOfUnits - b.completedUnits;
      return unitsLeftA - unitsLeftB; // Sort by units left (ascending)
    }
  });
  // Get current tasks for the current page
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = sortedTasks.slice(indexOfFirstTask, indexOfLastTask);

  // Format duration in hours
  const formatDuration = (duration) => {
    return `${duration} ${duration === 1 ? "hour" : "hours"}`;
  };

  // Calculate remaining units percentage
  const getRemainingUnitsPercentage = (task) => {
    const completedPercentage = (task.completedUnits / task.numberOfUnits) * 100;
    return (100 - completedPercentage).toFixed(1);
  };

  return (
    <Card sx={{ height: "100%" }}>
      <MDBox padding="1rem">
        {/* Header */}
        <MDBox
          variant="gradient"
          bgColor="black"
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius="lg"
          coloredShadow="black"
          py={2}
          pr={0.5}
          mt={-5}
          height="4.5rem"
          className="header-pulse"
        >
          <MDTypography variant="h5" textTransform="capitalize">
            {Title}
          </MDTypography>
        </MDBox>
        <div className="task-list-container">
          <table className="task-table">
            <thead>
              <tr>
                <th className="table-header" style={{ width: "35%" }}>
                  Task Name
                </th>
                <th className="table-header" style={{ width: "25%", textAlign: "center" }}>
                  Progress
                </th>

                {/* Conditionally render table headers */}
                {Title === "Lesser Time Left" ? (
                  <>
                    <th className="table-header" style={{ width: "20%", textAlign: "center" }}>
                      Duration
                    </th>
                    <th className="table-header" style={{ width: "20%", textAlign: "center" }}>
                      Time Left
                    </th>
                  </>
                ) : (
                  <>
                    <th className="table-header" style={{ width: "20%", textAlign: "center" }}>
                      Last Updated
                    </th>
                    <th className="table-header" style={{ width: "20%", textAlign: "center" }}>
                      Remaining %
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {/* Map over the current tasks for the current page */}
              {currentTasks.map((task, index) => {
                const percentComplete = (task.completedUnits / task.numberOfUnits) * 100;
                const isAnimated = animatedRows.includes(index);

                return (
                  <tr
                    key={index}
                    className={`task-row ${isAnimated ? "animate-in" : ""}`}
                    style={{
                      backgroundColor: task.color,
                      animationDelay: `${index * 0.1}s`,
                    }}
                  >
                    <td className="task-name">
                      <div className="task-name-hover">{task.taskName}</div>
                    </td>
                    <td className="task-cell">
                      <div className="progress-container5">
                        <div
                          className="progress-bar5 progress-animate"
                          style={{
                            width: `${percentComplete}%`,
                            backgroundColor: getProgressColor(percentComplete),
                          }}
                        ></div>
                      </div>
                    </td>

                    {/* Conditionally render table data */}
                    {Title === "Lesser Time Left" ? (
                      <>
                        <td className="task-cell">{formatDuration(task.duration)}</td>
                        <td
                          className={`task-cell ${
                            new Date(task.endDate) < new Date() ? "time-warning pulse" : ""
                          }`}
                        >
                          {formatTimeRemaining(task.createdAt, task.endDate)}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="task-cell last-updated">
                          {formatLastUpdated(task.updatedAt)}
                        </td>
                        <td className="task-cell remaining-percentage">
                          {getRemainingUnitsPercentage(task)}%
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="pagination-container">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="page-button hover-effect"
            >
              Previous
            </button>
            <span className="page-info">
              Page {currentPage} of {totalPages || 1}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
              className="page-button hover-effect"
            >
              Next
            </button>
          </div>
        </div>

        {/* Date and Time */}
        <MDBox display="flex" alignItems="center" mt={3}>
          <MDTypography variant="button" color="text" lineHeight={1} sx={{ mt: 0.15, mr: 0.5 }}>
            <Icon>schedule</Icon>
          </MDTypography>
          <MDTypography variant="button" color="text" fontWeight="light">
            {filteredTasks.length} Existing tasks
          </MDTypography>
        </MDBox>
      </MDBox>
    </Card>
  );
};

TaskList.propTypes = {
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      taskName: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
      completedUnits: PropTypes.number.isRequired,
      numberOfUnits: PropTypes.number.isRequired,
      createdAt: PropTypes.string.isRequired,
      _id: PropTypes.string,
      endDate: PropTypes.string.isRequired,
      updatedAt: PropTypes.string,
      duration: PropTypes.number.isRequired,
      priority: PropTypes.number,
    })
  ).isRequired,
  Title: PropTypes.string.isRequired,
};

export default TaskList;
