// Material Dashboard 2 React components
import MDBox from "components/MDBox";
// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { Typography } from "@mui/material";

function Blog() {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
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
          <a
            href="https://www.blogger.com/blog/posts/3930806961946401655" // External link URL
            target="_blank" // Opens link in a new tab
            rel="noopener noreferrer" // Security best practices
            style={{ textDecoration: "none", display: "block" }}
          >
            <MDBox
              position="relative"
              minHeight="8.75rem"
              borderRadius="xl"
              padding="50px"
              bgColor="#141826"
              sx={{
                color: "white",
                opacity: 1,
                textAlign: "center",
                transition: "transform 0.3s ease, background-color 0.3s ease", // Smooth transition effect
                "&:hover": {
                  backgroundColor: "#143380", // Change the background on hover
                  transform: "scale(1.05)", // Slightly enlarge the box
                },
              }}
            >
              {" "}
              <img
                src="https://www.cheggindia.com/wp-content/uploads/2023/06/5-Simple-Steps-to-Start-Blogging-in-India-in-2023.png"
                alt="mindMap"
                style={{
                  width: "70%", // Make the image width 100% of its container
                  height: "auto", // Maintain the aspect ratio
                  maxWidth: "100%", // Ensures the image does not exceed container width
                }}
              />
              <Typography variant="h4">Bloggers</Typography>
              <Typography variant="h8">
                Blogging lets you share ideas and connect with the world
              </Typography>
            </MDBox>
          </a>
        </MDBox>
      </MDBox>
    </DashboardLayout>
  );
}

export default Blog;
