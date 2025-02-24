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

  // Handle pin correct action and set JWT token
  const handlePinCorrect = () => {
    const token = "1234"; // In a real-world scenario, generate or retrieve the token
    localStorage.setItem("jwtToken", token);
    setJwtToken(token); // Update state to reflect the JWT token
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
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </ThemeProvider>
    </CacheProvider>
  );
}
