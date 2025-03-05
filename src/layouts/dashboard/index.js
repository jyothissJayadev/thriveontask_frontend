// @mui material components
import Grid from "@mui/material/Grid";
import { Box } from "@mui/material";
// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import TopOn from "./components/taskOn/TaskOn";
import EarningsWithChart from "./components/speed/EarningsChart";
import CustomerFulfillment from "./components/compare/CustomerFulfillment";
import TaskList from "./components/topTask";
import { useEffect, useState } from "react";
import { getTasks } from "api/api";
import Calendar from "./components/Calendar/Calendar";
import MemoryGame from "./components/games/memoryGame/MemoryGame";
import SnakeGame from "./components/games/SnakeGame/SnakeGame";
import { getSpeedForToday } from "api/api";
import { getAllSpeedByUserId } from "api/api";
import { getAllSpeedWithoutUserId } from "api/api";
import EndlessTimeCounter from "./components/EndlessTimeCounter/EndlessTimeCounter";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [speedDay, setSpeedDay] = useState(0);
  const [speedUser, setSpeedUser] = useState(0);
  const token = localStorage.getItem("jwtToken");
  const [allUsersSpeed, setAllUsersSpeed] = useState([]);

  useEffect(() => {
    // In Dashboard.js, modify the fetchTasks function to ensure each task has an id
    const fetchTasks = async () => {
      try {
        const response = await getTasks(token);
        if (response.success) {
          // Make sure each task has an id property
          const tasksWithIds = response.tasks.map((task, index) => {
            // If task already has an id, use it, otherwise add one
            return task.id ? task : { ...task, id: `task-${index}` };
          });
          setTasks(tasksWithIds);
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

  useEffect(() => {
    const fetchSpeed = async () => {
      try {
        const data = await getSpeedForToday(token); // Fetch speed data for today
        if (data && data.data) {
          setSpeedDay(data.data.completeSpeed); // Set the speed data in state
        } else {
          setSpeedDay(0); // Set speed to 0 if the response is invalid
        }
      } catch (err) {
        setError("Error fetching speed data for today");
        setSpeedDay(0); // Ensure speed is set to 0 if an error occurs
      } finally {
        setLoading(false);
      }
    };

    fetchSpeed(); // Call the fetch function
  }, [token]);
  useEffect(() => {
    const fetchSpeedAllUser = async () => {
      try {
        const data = await getAllSpeedByUserId(token); // Fetch speed data for today
        if (data && data.data) {
          // Extract completeSpeed values from the data array
          const speeds = data.data.map((item) => item.completeSpeed);
          console.log(speeds);
          // Calculate the average speed
          const totalSpeed = speeds.reduce((acc, speed) => acc + speed, 0);
          const averageSpeed = speeds.length > 0 ? totalSpeed / speeds.length : 0;

          // Set the average speed in the state
          setSpeedUser(averageSpeed);
        } else {
          setSpeedUser(0); // Set speed to 0 if the response is invalid
        }
      } catch (err) {
        setError("Error fetching speed data for today");
        setSpeedUser(0); // Ensure speed is set to 0 if an error occurs
      } finally {
        setLoading(false);
      }
    };

    fetchSpeedAllUser(); // Call the fetch function
  }, [token]);
  useEffect(() => {
    const fetchallSpeed = async () => {
      try {
        const data = await getAllSpeedWithoutUserId(token);
        if (data && data.data) {
          setAllUsersSpeed(data.data); // Store the entire data array
          console.log(data.data);
        } else {
          setAllUsersSpeed([]);
        }
      } catch (err) {
        setError("Error fetching speed data for all users");
        setAllUsersSpeed([]);
      } finally {
        setLoading(false);
      }
    };

    fetchallSpeed();
  }, [token]);
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
            <Grid item xs={12} md={6} lg={6}>
              <Box gridColumn={{ xs: "span 12", lg: "span 8" }} order={{ xs: 2, "2xl": 2 }}>
                <EarningsWithChart timeframe={"today's speed"} speed={speedDay} />
              </Box>
            </Grid>
            <Grid item xs={12} md={6} lg={6}>
              <Box gridColumn={{ xs: "span 12", lg: "span 8" }} order={{ xs: 2, "2xl": 2 }}>
                <EarningsWithChart timeframe={"Weekly speed"} speed={speedUser} />
              </Box>
            </Grid>
            <Grid item xs={12} md={6} lg={6}>
              <Box gridColumn={{ xs: "span 12", lg: "span 8" }} order={{ xs: 2, "2xl": 2 }}>
                <Calendar />
              </Box>
            </Grid>
            <Grid item xs={12} md={6} lg={6}>
              <Box gridColumn={{ xs: "span 12", lg: "span 8" }} order={{ xs: 2, "2xl": 2 }}>
                <CustomerFulfillment allUsersSpeedData={allUsersSpeed} />
              </Box>
            </Grid>{" "}
            <Grid item xs={12} md={6} lg={6}>
              <Box gridColumn={{ xs: "span 12", lg: "span 8" }} order={{ xs: 2, "2xl": 2 }}>
                <MemoryGame />
              </Box>
            </Grid>{" "}
            <Grid item xs={12} md={6} lg={6}>
              <Box gridColumn={{ xs: "span 12", lg: "span 8" }} order={{ xs: 2, "2xl": 2 }}>
                <SnakeGame />
              </Box>
            </Grid>{" "}
            <Grid item xs={12} md={6} lg={12}>
              <Box gridColumn={{ xs: "span 12", lg: "span 8" }} order={{ xs: 2, "2xl": 2 }}>
                <EndlessTimeCounter />
              </Box>
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
    </DashboardLayout>
  );
}

export default Dashboard;
