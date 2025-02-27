import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox"; // Assuming MDBox is a custom component
import Sidenav from "examples/Sidenav";
import Configurator from "examples/Configurator";
import themeDark from "assets/theme-dark";
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import routes from "routes";
import { useMaterialUIController, setMiniSidenav, setOpenConfigurator } from "context";
import brandWhite from "assets/images/logo-ct.png";
import brandDark from "assets/images/logo-ct-dark.png";
import PinInput from "layouts/pincode/PinInput"; // Ensure this is the correct path
import useSessionTimeout from "context/useSessionTimeout";
import TaskManagementDashboard from "layouts/tables/task/TaskManagementDashboard";
import TaskUpdator from "layouts/tables/IndividualTask/TaskUpdator";

export default function App() {
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    direction,
    layout,
    openConfigurator,
    sidenavColor,
    transparentSidenav,
    whiteSidenav,
    darkMode,
  } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const [rtlCache] = useState(
    createCache({
      key: "rtl",
      stylisPlugins: [rtlPlugin],
    })
  );
  const { pathname } = useLocation();
  const [jwtToken, setJwtToken] = useState(localStorage.getItem("jwtToken"));

  // Handle sidenav open on mouse enter and close on mouse leave
  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };
  useSessionTimeout();

  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);

  // Set document body direction based on RTL or LTR
  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  // Reset scroll position when pathname changes
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  // Handle route rendering dynamically
  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) {
        return getRoutes(route.collapse);
      }
      if (route.route) {
        return <Route exact path={route.route} element={route.component} key={route.key} />;
      }
      return null;
    });

  // Config button to open configurator
  const configsButton = (
    <MDBox
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="3.25rem"
      height="3.25rem"
      bgColor="white"
      shadow="sm"
      borderRadius="50%"
      position="fixed"
      right="2rem"
      bottom="2rem"
      zIndex={99}
      color="dark"
      sx={{ cursor: "pointer" }}
      onClick={handleConfiguratorOpen}
    >
      <Icon fontSize="small" color="inherit">
        settings
      </Icon>
    </MDBox>
  );
  // Add this to your useEffect block or replace the existing useSessionTimeout hook implementation
  useEffect(() => {
    // Function to check and clear token if it's expired
    const checkTokenExpiration = () => {
      const token = localStorage.getItem("jwtToken");
      const tokenTimestamp = localStorage.getItem("jwtTokenTimestamp");

      if (token && tokenTimestamp) {
        const currentTime = new Date().getTime();
        const tokenTime = parseInt(tokenTimestamp, 10);
        const threeHoursInMs = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

        if (currentTime - tokenTime > threeHoursInMs) {
          // Token has expired (been in localStorage for more than 3 hours)
          localStorage.removeItem("jwtToken");
          localStorage.removeItem("jwtTokenTimestamp");
          setJwtToken(null); // Update state to trigger re-render and redirect to PinInput
        }
      }
    };

    // Check immediately
    checkTokenExpiration();

    // Check periodically
    const interval = setInterval(checkTokenExpiration, 60000); // Check every minute

    // Update the timestamp on user activity
    const updateTimestamp = () => {
      if (localStorage.getItem("jwtToken")) {
        localStorage.setItem("jwtTokenTimestamp", new Date().getTime().toString());
      }
    };

    // Add event listeners for user activity
    window.addEventListener("click", updateTimestamp);
    window.addEventListener("keypress", updateTimestamp);
    window.addEventListener("scroll", updateTimestamp);
    window.addEventListener("mousemove", updateTimestamp);

    // Cleanup function
    return () => {
      clearInterval(interval);
      window.removeEventListener("click", updateTimestamp);
      window.removeEventListener("keypress", updateTimestamp);
      window.removeEventListener("scroll", updateTimestamp);
      window.removeEventListener("mousemove", updateTimestamp);
    };
  }, [setJwtToken]);

  // Also modify your handlePinCorrect function to set the initial timestamp:
  const handlePinCorrect = () => {
    const token = "1234"; // In a real-world scenario, generate or retrieve the token
    localStorage.setItem("jwtToken", token);
    localStorage.setItem("jwtTokenTimestamp", new Date().getTime().toString());
    setJwtToken(token);
  };
  // If JWT token doesn't exist, redirect to the PinInput page
  if (!jwtToken) {
    return <PinInput onPinCorrect={handlePinCorrect} />;
  }

  return (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={themeDark}>
        <CssBaseline />
        {layout === "dashboard" && (
          <>
            <Sidenav
              color={sidenavColor}
              brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
              brandName="Material Dashboard 2"
              routes={routes}
              onMouseEnter={handleOnMouseEnter}
              onMouseLeave={handleOnMouseLeave}
            />
            <Configurator />
            {configsButton}
          </>
        )}
        {layout === "vr" && <Configurator />}

        <Routes>
          {getRoutes(routes)}
          <Route path="*" element={<Navigate to="/tasks" />} />{" "}
          <Route path="/task/:taskId" element={<TaskUpdator />} />
        </Routes>
      </ThemeProvider>
    </CacheProvider>
  );
}
