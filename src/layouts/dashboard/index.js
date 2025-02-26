// @mui material components
import Grid from "@mui/material/Grid";
import { Box } from "@mui/material";
// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import reportsLineChartData from "layouts/dashboard/data/reportsLineChartData";
import TopOn from "./components/taskOn/TaskOn";
import EarningsWithChart from "./components/speed/EarningsChart";
import SalesOverview from "./components/timeExpect/SalesOverview";
import CustomerFulfillment from "./components/compare/CustomerFulfillment";
import TaskList from "./components/topTask";
import { useEffect, useState } from "react";
import { getTasks } from "api/api";
function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        const response = await getTasks(token);
        if (response.success) {
          setTasks(response.tasks);
        } else {
          setError(response.error);
        }
      } catch (err) {
        setError("Error fetching tasks");
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}></Grid>
        </Grid>

        <MDBox mt={4.5}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6} lg={6}>
              <MDBox mb={3}>
                <TaskList tasks={tasks} Title={"Lesser Time Left"} />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={6}>
              <MDBox mb={3}>
                <TaskList tasks={tasks} Title={"Not Seen for Long Time"} />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
        <MDBox>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={12}>
              <Box gridColumn={{ xs: "span 12", lg: "span 8" }} order={{ xs: 2, "2xl": 2 }}>
                <TopOn />
              </Box>
            </Grid>
            <Grid item xs={12} md={6} lg={6}>
              <Box gridColumn={{ xs: "span 12", lg: "span 8" }} order={{ xs: 2, "2xl": 2 }}>
                <EarningsWithChart />
              </Box>
            </Grid>
            <Grid item xs={12} md={6} lg={6}>
              <Box gridColumn={{ xs: "span 12", lg: "span 8" }} order={{ xs: 2, "2xl": 2 }}>
                <EarningsWithChart />
              </Box>
            </Grid>
            <Grid item xs={12} md={6} lg={6}>
              <Box gridColumn={{ xs: "span 12", lg: "span 8" }} order={{ xs: 2, "2xl": 2 }}>
                <SalesOverview />
              </Box>
            </Grid>
            <Grid item xs={12} md={6} lg={6}>
              <Box gridColumn={{ xs: "span 12", lg: "span 8" }} order={{ xs: 2, "2xl": 2 }}>
                <CustomerFulfillment />
              </Box>
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
    </DashboardLayout>
  );
}

export default Dashboard;
