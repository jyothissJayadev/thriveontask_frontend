import React, { useState } from "react";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import TimelineScale from "./TimelineScale";
import MatrixItemNew from "./listView/MatrixItemNew";

const Gantt = () => {
  const [items, setItems] = useState([
    {
      id: 1,
      date: "18. mai 2018",
      title: "Uudne lahendus Sinu vara kaitsmiseks",
      details:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eu justo nec arcu fermentum varius. Nullam in odio felis. Sed tincidunt, nisl nec aliquet ultrices, leo odio tincidunt orci.",
      startTime: "2025-02-20T08:00",
      endTime: "2025-02-20T10:00",
    },
  ]);

  const handleEdit = (id, startTime, endTime) => {
    setItems(items.map((item) => (item.id === id ? { ...item, startTime, endTime } : item)));
  };

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
        {/* Iterate through items and pass them to MatrixItemNew */}
        {items.map((item) => (
          <MatrixItemNew key={item.id} item={item} onEdit={handleEdit} />
        ))}
      </MDBox>
    </DashboardLayout>
  );
};

export default Gantt;
