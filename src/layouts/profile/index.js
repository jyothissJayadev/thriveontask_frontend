// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

// Overview page components
import Header from "layouts/profile/components/Header";

function Overview() {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox
        display="flex"
        alignItems="center"
        justifyContent="center"
        position="relative"
        minHeight="18.75rem"
        borderRadius="xl"
        bgColor="primary" // Set a background color (change "primary" to any valid color)
        sx={{
          color: "white", // Set text color for contrast
          opacity: 1, // Full opacity
          textAlign: "center", // Align text to the center
        }}
      >
        hello
      </MDBox>
    </DashboardLayout>
  );
}

export default Overview;
