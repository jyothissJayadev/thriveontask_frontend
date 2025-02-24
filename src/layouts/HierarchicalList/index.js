// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import Grid from "@mui/material/Grid";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDTypography from "components/MDTypography";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import { Typography } from "@mui/material";
import HierarchicalList from "./HierarchicalList";

function Hierarchicy() {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={12}>
        <MDBox
          display="flex"
          alignItems="center"
          justifyContent="center"
          position="relative"
          minHeight="18.75rem"
          borderRadius="xl"
          padding="50px"
          bgColor="#263354" // Set a background color (change "primary" to any valid color)
          sx={{
            color: "white", // Set text color for contrast
            opacity: 1, // Full opacity
            textAlign: "center", // Align text to the center
          }}
        >
          <HierarchicalList />
        </MDBox>
      </MDBox>
    </DashboardLayout>
  );
}

export default Hierarchicy;
