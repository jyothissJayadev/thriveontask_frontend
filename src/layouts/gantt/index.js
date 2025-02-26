import React, { useState } from "react";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import TimelineScale from "./TimelineScale";

const Gantt = () => {
  return (
    <DashboardLayout>
      <DashboardNavbar />

      {/* Timeline scale section */}
      <MDBox
        display="flex"
        alignItems="center"
        justifyContent="center"
        position="relative"
        minHeight="18.75rem"
        borderRadius="xl"
        bgColor="primary"
        sx={{
          color: "white",
          opacity: 1,
          textAlign: "center",
        }}
      >
        <TimelineScale />
      </MDBox>

      {/* Spacer */}
      <br />

      {/* Matrix items section */}
    </DashboardLayout>
  );
};

export default Gantt;
