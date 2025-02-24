import { useEffect } from "react";

const useSessionTimeout = () => {
  useEffect(() => {
    // Set the 2-hour (120 minutes) timer
    const timer = setTimeout(() => {
      // Remove items from localStorage
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("username");

      // Reload the page
      window.location.reload();
    }, 2 * 60 * 60 * 1000); // 2 hours in milliseconds

    // Cleanup the timer when the component unmounts (optional, but good practice)
    return () => clearTimeout(timer);
  }, []); // Empty dependency array to run this effect once when the component is mounted
};

export default useSessionTimeout;
