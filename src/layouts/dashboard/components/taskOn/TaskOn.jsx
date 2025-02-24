import React, { useState } from "react";
import { Grid, Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import MDBox from "components/MDBox"; // Assuming MDBox is a custom component
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// Importing `styled` from MUI to style components
import { styled } from "@mui/material/styles";

// Importing Material UI Icons
import { AccessAlarm, Pending, EmojiEmotions, Widgets } from "@mui/icons-material"; // Example icons

const TaskOn = () => {
  // State to handle the selected timeframe
  const [timeframe, setTimeframe] = useState("day");

  // Function to handle timeframe change
  const handleTimeframeChange = (event, newTimeframe) => {
    if (newTimeframe) {
      setTimeframe(newTimeframe);
    }
  };

  // Data with different counts for day, week, and month
  const data = [
    {
      icon: <AccessAlarm />, // Change string to icon components
      title: "Total Time",
      counts: { day: 281, week: 1200, month: 5000 },
      percentage: { color: "success", amount: "100%", label: "Great Job Done" },
      color: "dark",
    },
    {
      icon: <Pending />,
      title: "Expected time",
      counts: { day: 2300, week: 8000, month: 12000 },
      percentage: { color: "success", amount: "100%", label: "Fast up the work" },
    },
    {
      icon: <EmojiEmotions />,
      title: "Pending Task",
      counts: { day: 34000, week: 100000, month: 250000 },
      percentage: { color: "success", amount: "100%", label: "Yours to tackle" },
      color: "success",
    },
    {
      icon: <Widgets />,
      title: "Completed Task",
      counts: { day: 34000, week: 200000, month: 600000 },
      percentage: { color: "success", amount: "100%", label: "Wow that's great" },
      color: "success",
    },
  ];

  return (
    <MDBox
      display="flex"
      flexDirection="column" // Stack children vertically
      justifyContent="space-between" // Space between the top and bottom sections
      alignItems="center" // Center align both top and bottom content
      position="relative"
      minHeight="18.75rem"
      borderRadius="xl"
      padding="50px"
      bgColor="#141826" // Set a background color (change "primary" to any valid color)
      sx={{
        color: "white", // Set text color for contrast
        opacity: 1, // Full opacity
        textAlign: "center", // Align text to the center
      }}
    >
      {/* Buttons at the top */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 3, color: "white" }}>
        <StyledToggleButtonGroup
          value={timeframe}
          exclusive
          onChange={handleTimeframeChange}
          aria-label="timeframe"
          sx={{
            // Stack buttons vertically on xs (small) screens
            flexDirection: { xs: "column", sm: "row" },
            "& .MuiToggleButton-root": {
              width: { xs: "100%", sm: "auto" }, // Make buttons full width on small screens
              marginBottom: { xs: "8px", sm: 0 }, // Add margin between buttons on small screens
            },
          }}
        >
          <ToggleButton value="day" aria-label="day view">
            Day
          </ToggleButton>
          <ToggleButton value="week" aria-label="week view">
            Week
          </ToggleButton>
          <ToggleButton value="month" aria-label="month view">
            Month
          </ToggleButton>
        </StyledToggleButtonGroup>
      </Box>

      {/* Cards content at the bottom */}
      <Grid container spacing={3}>
        {data.map((item, index) => (
          <Grid key={index} item xs={12} sm={6} md={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color={item.success} // Use a default color if not provided
                icon={item.icon}
                title={item.title}
                count={item.counts[timeframe]} // Dynamically set the count based on selected timeframe
                percentage={item.percentage}
              />
            </MDBox>
          </Grid>
        ))}
      </Grid>
    </MDBox>
  );
};

// Styled component for ToggleButtonGroup
const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  marginBottom: "1rem",
  "& .MuiToggleButton-root": {
    padding: "8px 24px",
    borderRadius: "8px",
    color: "white",
    margin: "0 4px",
    "&.Mui-selected": {
      backgroundColor: "#1976d2",
      color: "#fff",
      "&:hover": {
        backgroundColor: "#1565c0",
      },
    },
  },
}));

export default TaskOn;
