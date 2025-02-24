// TaskList.jsx
import React, { useState, useEffect } from "react";
import "./TaskList.css";
import { Card, Icon } from "@mui/material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

const TaskList = () => {
  // Sample data - replace with your actual dataset
  const initialTasks = [
    {
      id: 1,
      name: "Website redesign",
      percentComplete: 75,
      duration: "5 days",
      timeLeft: "2 days",
      color: "#e6f0ff",
    },
    {
      id: 2,
      name: "API integration",
      percentComplete: 45,
      duration: "10 days",
      timeLeft: "6 days",
      color: "#ffe6e6",
    },
    {
      id: 3,
      name: "Database migration",
      percentComplete: 90,
      duration: "3 days",
      timeLeft: "1 day",
      color: "#e6ffe6",
    },
    {
      id: 4,
      name: "User testing",
      percentComplete: 20,
      duration: "7 days",
      timeLeft: "6 days",
      color: "#fff5e6",
    },
    {
      id: 5,
      name: "Documentation",
      percentComplete: 60,
      duration: "4 days",
      timeLeft: "2 days",
      color: "#f0e6ff",
    },
    {
      id: 6,
      name: "Security audit",
      percentComplete: 30,
      duration: "6 days",
      timeLeft: "4 days",
      color: "#ffe6f7",
    },
    {
      id: 7,
      name: "Performance tuning",
      percentComplete: 85,
      duration: "5 days",
      timeLeft: "1 day",
      color: "#e6ffff",
    },
    {
      id: 8,
      name: "Bug fixes",
      percentComplete: 50,
      duration: "3 days",
      timeLeft: "1.5 days",
      color: "#efffde",
    },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const [showProgressBar, setShowProgressBar] = useState(true);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  const tasksPerPage = 5;
  const totalPages = Math.ceil(initialTasks.length / tasksPerPage);

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
      // Determine if we should show progress bars based on available width
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

  // Get current tasks
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = initialTasks.slice(indexOfFirstTask, indexOfLastTask);

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
            hello
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
                <th className="table-header" style={{ width: "20%", textAlign: "center" }}>
                  Duration
                </th>
                <th className="table-header" style={{ width: "20%", textAlign: "center" }}>
                  Time Left
                </th>
              </tr>
            </thead>
            <tbody>
              {currentTasks.map((task) => (
                <tr key={task.id} className="task-row" style={{ backgroundColor: task.color }}>
                  <td className="task-name">{task.name}</td>
                  <td className="task-cell">
                    {showProgressBar ? (
                      <div className="progress-container">
                        <div
                          className="progress-bar"
                          style={{
                            width: `${task.percentComplete}%`,
                            backgroundColor: getProgressColor(task.percentComplete),
                          }}
                        ></div>
                      </div>
                    ) : (
                      <span style={{ color: getProgressColor(task.percentComplete) }}>
                        {task.percentComplete}%
                      </span>
                    )}
                  </td>
                  <td className="task-cell">{task.duration}</td>
                  <td className="task-cell">{task.timeLeft}</td>
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
            15 Existing taks
          </MDTypography>
        </MDBox>
      </MDBox>
    </Card>
  );
};

export default TaskList;
