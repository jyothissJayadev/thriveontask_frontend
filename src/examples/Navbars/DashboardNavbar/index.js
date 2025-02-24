import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import PropTypes from "prop-types";

// @material-ui core components
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Icon from "@mui/material/Icon";
import useMediaQuery from "@mui/material/useMediaQuery";
import jyothissProfile from "../../../assets/images/jyothiss.jpg";
import aleenaProfile from "../../../assets/images/aleena.jpg";
// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import Breadcrumbs from "examples/Breadcrumbs";

// Custom styles for DashboardNavbar
import {
  navbar,
  navbarContainer,
  navbarRow,
  navbarIconButton,
  navbarMobileMenu,
} from "examples/Navbars/DashboardNavbar/styles";

// Material Dashboard 2 React context
import {
  useMaterialUIController,
  setTransparentNavbar,
  setMiniSidenav,
  setOpenConfigurator,
} from "context";

function DashboardNavbar({ absolute, light, isMini }) {
  const [navbarType, setNavbarType] = useState("static");
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentNavbar, fixedNavbar, openConfigurator, darkMode } = controller;
  const [openMenu, setOpenMenu] = useState(false);
  const route = useLocation().pathname.split("/").slice(1);
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("md"));

  // Get username from localStorage
  const userName = localStorage.getItem("username"); // Get username from localStorage

  const handleSignOut = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("username");
    window.location.reload(); // Refresh the page
  };

  useEffect(() => {
    setNavbarType("static");

    function handleTransparentNavbar() {
      setTransparentNavbar(dispatch, (fixedNavbar && window.scrollY === 0) || !fixedNavbar);
    }

    window.addEventListener("scroll", handleTransparentNavbar);
    handleTransparentNavbar();

    return () => window.removeEventListener("scroll", handleTransparentNavbar);
  }, [dispatch, fixedNavbar]);

  const handleMiniSidenav = () => setMiniSidenav(dispatch, !miniSidenav);
  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);
  const handleOpenMenu = (event) => setOpenMenu(event.currentTarget);
  const handleCloseMenu = () => setOpenMenu(false);
  const jobRoles = JSON.parse(localStorage.getItem("jobRoles")) || [];
  // Render the profile menu
  const renderMenu = () => (
    <Menu
      anchorEl={openMenu}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={Boolean(openMenu)}
      onClose={handleCloseMenu}
    >
      <MenuItem>
        <Typography variant="caption" color="text.secondary">
          Roles:
        </Typography>
      </MenuItem>
      {jobRoles.map((role, index) => (
        <MenuItem key={index} dense>
          {role}
        </MenuItem>
      ))}
    </Menu>
  );
  const username = localStorage.getItem("username");
  const profileSrc = username === "Mariam Aleena" ? aleenaProfile : jyothissProfile;
  const iconsStyle = ({ palette: { dark, white, text }, functions: { rgba } }) => ({
    color: () => {
      let colorValue = light || darkMode ? white.main : dark.main;

      if (transparentNavbar && !light) {
        colorValue = darkMode ? rgba(text.main, 0.6) : text.main;
      }

      return colorValue;
    },
  });

  return (
    <AppBar
      position={navbarType}
      color="inherit"
      sx={(theme) => navbar(theme, { transparentNavbar, absolute, light, darkMode })}
    >
      <Toolbar sx={(theme) => navbarContainer(theme)}>
        <MDBox color="inherit" mb={{ xs: 1, md: 0 }} sx={(theme) => navbarRow(theme, { isMini })}>
          {/* Menu Icon for mobile */}
          {isMobile && (
            <IconButton
              size="small"
              color="inherit"
              sx={navbarMobileMenu}
              onClick={handleMiniSidenav}
            >
              <Icon sx={iconsStyle} fontSize="medium">
                {miniSidenav ? "menu_open" : "menu"}
              </Icon>
            </IconButton>
          )}
          <Breadcrumbs icon="home" title={route[route.length - 1]} route={route} light={light} />
        </MDBox>
        {isMini ? null : (
          <MDBox sx={(theme) => navbarRow(theme, { isMini })}>
            <MDBox display="flex" alignItems="center">
              {/* User Profile Section */}
              <MDBox display="flex" alignItems="center" mr={2}>
                <IconButton
                  size="small"
                  color="inherit"
                  sx={navbarIconButton}
                  onClick={handleOpenMenu}
                >
                  <Avatar src={profileSrc} />

                  <Typography variant="button" sx={{ ml: 1, display: { xs: "none", sm: "block" } }}>
                    &nbsp; {userName || "Admin"} {/* Display username or fallback to "Admin" */}
                  </Typography>
                  <Icon sx={{ ...iconsStyle, ml: 1 }}>arrow_drop_down</Icon>
                </IconButton>
                {renderMenu()}
              </MDBox>

              {/* Sign Out Button */}
              <Button
                variant="text"
                color="error"
                startIcon={<Icon>logout</Icon>}
                onClick={handleSignOut}
                sx={{
                  "& .MuiButton-startIcon": {
                    display: "flex",
                  },
                  "& .MuiButton-endIcon": {
                    display: "flex",
                  },
                  "& .MuiButton-startIcon>*:nth-of-type(1)": {
                    fontSize: 15,
                  },
                }}
              >
                <Typography sx={{ display: { xs: "none", sm: "block" } }}>
                  {" "}
                  &nbsp;Sign Out
                </Typography>
              </Button>
            </MDBox>
          </MDBox>
        )}
      </Toolbar>
    </AppBar>
  );
}

// Setting default values for the props of DashboardNavbar
DashboardNavbar.defaultProps = {
  absolute: false,
  light: false,
  isMini: false,
};

// Typechecking props for the DashboardNavbar
DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
};

export default DashboardNavbar;
