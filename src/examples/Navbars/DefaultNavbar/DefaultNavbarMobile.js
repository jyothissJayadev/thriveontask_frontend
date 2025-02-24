import PropTypes from "prop-types";
import Menu from "@mui/material/Menu";
import MDBox from "components/MDBox";
import DefaultNavbarLink from "examples/Navbars/DefaultNavbar/DefaultNavbarLink";

function DefaultNavbarMobile({ open, close }) {
  const { width } = open && open.getBoundingClientRect();

  return (
    <Menu
      getContentAnchorEl={null}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
      anchorEl={open}
      open={Boolean(open)}
      onClose={close}
      MenuListProps={{
        style: {
          width: `calc(${width}px - 4rem)`,
          backgroundColor: "rgba(0, 0, 0, 0.2)", // Adjusting transparency to 0.2
        },
      }}
    >
      <MDBox px={0.5}>
        <DefaultNavbarLink icon="donut_large" name="dashboard" route="/dashboard" />
        <DefaultNavbarLink icon="person" name="profile" route="/profile" />
      </MDBox>
    </Menu>
  );
}

// Typechecking props for the DefaultNavbarMenu
DefaultNavbarMobile.propTypes = {
  open: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]).isRequired,
  close: PropTypes.oneOfType([PropTypes.func, PropTypes.bool, PropTypes.object]).isRequired,
};

export default DefaultNavbarMobile;
