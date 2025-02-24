import React, { useState } from "react";
import PropTypes from "prop-types";
import { Card, Divider, Icon, Button, Box } from "@mui/material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDAlert from "components/MDAlert";
import MDTypography from "components/MDTypography";

function ReportsLineChart({ color, title, description, date }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 5;
  const totalItems = 10;

  // Sample data array with task names and colors
  const tasks = [
    { name: "Task 1", color: "success" },
    { name: "Task 2", color: "info" },
    { name: "Task 3", color: "warning" },
  ];

  // Generate the alerts based on the tasks data
  const items = tasks.map((task, index) => ({
    content: (
      <MDBox pt={2} px={2} key={index}>
        <MDAlert color={task.color}>
          <MDTypography variant="body2" color="white">
            This is a custom alert for {task.name} with{" "}
            <MDTypography component="a" href="#" variant="body2" fontWeight="medium" color="white">
              a custom link
            </MDTypography>
            . Click it if you&apos;re curious!
          </MDTypography>
        </MDAlert>
      </MDBox>
    ),
  }));

  const handleNext = () => {
    if (currentIndex + itemsPerPage < totalItems) {
      setCurrentIndex(currentIndex + itemsPerPage);
    }
  };

  const handlePrevious = () => {
    if (currentIndex - itemsPerPage >= 0) {
      setCurrentIndex(currentIndex - itemsPerPage);
    }
  };

  return (
    <Card sx={{ height: "100%" }}>
      <MDBox padding="1rem">
        {/* Header */}
        <MDBox
          variant="gradient"
          bgColor={color}
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius="lg"
          coloredShadow={color}
          py={2}
          pr={0.5}
          mt={-5}
          height="4.5rem"
        >
          <MDTypography variant="h5" textTransform="capitalize">
            {title}
          </MDTypography>
        </MDBox>

        {/* List of Alerts */}
        {/* <MDBox pt={3} pb={1} px={1}>
          <MDBox>
            {items.slice(currentIndex, currentIndex + itemsPerPage).map((item, index) => (
              <Box key={index} sx={{ marginBottom: 2 }}>
                {item.content}
              </Box>
            ))}
          </MDBox>
          <Divider />
          <MDBox display="flex" justifyContent="space-between" mt={2}>
            <Button onClick={handlePrevious} disabled={currentIndex === 0} variant="outlined">
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={currentIndex + itemsPerPage >= totalItems}
              variant="outlined"
            >
              Next
            </Button>
          </MDBox>
        </MDBox> */}

        {/* Date and Time */}
        <MDBox display="flex" alignItems="center" mt={3}>
          <MDTypography variant="button" color="text" lineHeight={1} sx={{ mt: 0.15, mr: 0.5 }}>
            <Icon>schedule</Icon>
          </MDTypography>
          <MDTypography variant="button" color="text" fontWeight="light">
            {tasks.length} Existing taks
          </MDTypography>
        </MDBox>
      </MDBox>
    </Card>
  );
}

// Setting default values for the props of ReportsLineChart
ReportsLineChart.defaultProps = {
  color: "success",
  description: "This is a custom task that will display alerts with links.",
};

// Typechecking props for the ReportsLineChart
ReportsLineChart.propTypes = {
  color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "dark"]),
  title: PropTypes.string.isRequired,
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  date: PropTypes.string.isRequired,
};

export default ReportsLineChart;
