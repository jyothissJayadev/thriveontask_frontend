// src/api.js
import axiosInstance from "./axios";

// Login User
export const loginUser = async (pincode) => {
  try {
    const response = await axiosInstance.post("/auth/login", { pincode });
    return response.data;
  } catch (error) {
    return { success: false, error: error.response?.data?.error || error.message };
  }
};

export const createTask = async (
  taskName,
  numberOfUnits,
  completedUnits,
  duration,
  timeframe,
  token
) => {
  try {
    const response = await axiosInstance.post(
      "/tasks/tasks", // endpoint
      {
        taskName,
        numberOfUnits,
        completedUnits,
        duration,
        timeframe,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    // Check if the error is from the response
    if (error.response) {
      // Axios response errors
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || error.message,
      };
    } else if (error.request) {
      // Axios request errors (no response from server)
      console.error("No response received from server", error.request);
      return {
        success: false,
        error: "No response received from server.",
      };
    } else {
      // Generic error for other cases
      console.error("Error in setting up the request", error.message);
      return {
        success: false,
        error: error.message || "An unexpected error occurred.",
      };
    }
  }
};
// Update Profile
export const getTasks = async (token) => {
  try {
    const response = await axiosInstance.get("/tasks/tasks", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    // Handle error response
    if (error.response) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || error.message,
      };
    } else if (error.request) {
      console.error("No response received from server", error.request);
      return {
        success: false,
        error: "No response received from server.",
      };
    } else {
      console.error("Error in setting up the request", error.message);
      return {
        success: false,
        error: error.message || "An unexpected error occurred.",
      };
    }
  }
};
// update completeunits
export const updateCompletedUnits = async (taskId, completedUnits, token) => {
  try {
    const response = await axiosInstance.put(
      `/tasks/tasks/${taskId}/completed-units`, // endpoint to update only completedUnits
      { completedUnits },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    if (error.response) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || error.message,
      };
    } else if (error.request) {
      console.error("No response received from server", error.request);
      return {
        success: false,
        error: "No response received from server.",
      };
    } else {
      console.error("Error in setting up the request", error.message);
      return {
        success: false,
        error: error.message || "An unexpected error occurred.",
      };
    }
  }
};
//  update task
export const updateTask = async (
  taskId,
  taskName,
  numberOfUnits,
  completedUnits,
  endDate,
  timeframe,
  token
) => {
  try {
    const response = await axiosInstance.put(
      `/tasks/tasks/${taskId}`, // endpoint to update task
      {
        taskName,
        numberOfUnits,
        completedUnits,
        endDate,
        timeframe,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    if (error.response) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || error.message,
      };
    } else if (error.request) {
      console.error("No response received from server", error.request);
      return {
        success: false,
        error: "No response received from server.",
      };
    } else {
      console.error("Error in setting up the request", error.message);
      return {
        success: false,
        error: error.message || "An unexpected error occurred.",
      };
    }
  }
};
