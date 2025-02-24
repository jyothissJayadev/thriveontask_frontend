// Material Dashboard 2 React components
import MDBox from "components/MDBox";
// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { Typography } from "@mui/material";
import StickyNotesApp from "./components/TaskList";

function Notes() {
  return (
    <DashboardLayout>
      <DashboardNavbar />

      <StickyNotesApp />
    </DashboardLayout>
  );
}

export default Notes;
