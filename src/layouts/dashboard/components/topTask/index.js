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

  const tasksPerPage = 5;
  const totalPages = Math.ceil(tasks.length / tasksPerPage);

  // Get progress bar color based on completion percentage
  const getProgressColor = (percentage) => {
    if (percentage < 25) {
      return "#ff4d4d"; // Red for low completion
    } else if (percentage < 50) {
      return "#ffa64d"; // Orange for getting started
    } else if (percentage < 75) {
      return "#ffff4d"; // Yellow for halfway
    } else if (percentage < 90) {
      return "#4dff4d"; // Green for good progress
    } else {
      return "#00cc00"; // Dark green for near completion
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

  // Handle pagination
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Sorting function based on Title
  const sortedTasks = [...tasks].sort((a, b) => {
    if (Title === "Lesser Time Left") {
      const timeLeftA = new Date(a.createdAt) - new Date(a.endDate);
      const timeLeftB = new Date(b.createdAt) - new Date(b.endDate);
      return timeLeftA - timeLeftB; // Sort by time difference (ascending)
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
                      Total Units
                    </th>
                    <th className="table-header" style={{ width: "20%", textAlign: "center" }}>
                      Units Left
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {/* Map over the current tasks for the current page */}
              {currentTasks.map((task) => (
                <tr key={task.id} className="task-row" style={{ backgroundColor: task.color }}>
                  <td className="task-name">{task.taskName}</td>
                  <td className="task-cell">
                    <div className="progress-container">
                      <div
                        className="progress-bar"
                        style={{
                          width: `${(task.completedUnits / task.numberOfUnits) * 100}%`,
                          backgroundColor: getProgressColor(task.percentComplete),
                        }}
                      ></div>
                    </div>
                  </td>

                  {/* Conditionally render table data */}
                  {Title === "Lesser Time Left" ? (
                    <>
                      <td className="task-cell">{task.duration}</td>
                      <td className="task-cell">
                        {new Date(task.createdAt) - new Date(task.endDate)} ms
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="task-cell">{task.numberOfUnits}</td>
                      <td className="task-cell">{task.numberOfUnits - task.completedUnits}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination-container">
            <button onClick={handlePrevPage} disabled={currentPage === 1} className="page-button">
              Previous
            </button>
            <span className="page-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="page-button"
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
            {tasks.length} Existing tasks
          </MDTypography>
        </MDBox>
      </MDBox>
    </Card>
  );
};

TaskList.propTypes = {
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      taskName: PropTypes.string.isRequired,
      percentComplete: PropTypes.number.isRequired,
      duration: PropTypes.string.isRequired,
      timeLeft: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
      completedUnits: PropTypes.number.isRequired,
      numberOfUnits: PropTypes.number.isRequired,
      createdAt: PropTypes.string.isRequired,
      endDate: PropTypes.string.isRequired,
    })
  ).isRequired,
  Title: PropTypes.string.isRequired,
};

export default TaskList;
