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
export const getTaskById = async (taskId, token) => {
  try {
    const response = await axiosInstance.get(`/tasks/tasks/id/${taskId}`, {
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
export const updateTaskTime = async (taskId, startTime, endTime, token) => {
  try {
    console.log(taskId, startTime, endTime, token);
    const response = await axiosInstance.put(
      `/tasks/tasks/${taskId}/times`,
      {
        startTime,
        endTime,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log(response);
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

//  update task
export const updateTask = async (token, _id, editedTask) => {
  try {
    const { taskName, numberOfUnits, completedUnits, endDate, timeframe } = editedTask;

    // Send the individual properties to the backend
    const response = await axiosInstance.put(
      `/tasks/tasks/${_id}`, // endpoint to update task
      {
        taskName,
        numberOfUnits,
        completedUnits,
        endDate,
        timeframe,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(response);
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
//updated THE TASK
export const updateTaskPriority = async (token, taskId, priority) => {
  try {
    const response = await axiosInstance.put(
      `/tasks/tasks/${taskId}/priority`, // Endpoint to update task priority
      { priority }, // Data to send (new priority)
      { headers: { Authorization: `Bearer ${token}` } } // Token in the headers for authentication
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
//DELTE THE TASK
export const deleteTask = async (token, taskId) => {
  try {
    const response = await axiosInstance.delete(
      `/tasks/tasks/${taskId}`, // endpoint to delete a task
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

//api the notes backend
// src/api.js

// Create a new note
export const createNote = async (title, content, color, token) => {
  try {
    const response = await axiosInstance.post(
      "/notes/notes", // Backend endpoint to create a note
      { title, content, color }, // Data to send to the backend
      {
        headers: { Authorization: `Bearer ${token}` }, // Send token in the headers for authentication
      }
    );
    return response.data; // Return the response from the backend
  } catch (error) {
    return handleError(error);
  }
};

// Get all notes for the authenticated user
export const getNotes = async (token) => {
  try {
    const response = await axiosInstance.get("/notes/notes", {
      headers: { Authorization: `Bearer ${token}` }, // Include the token for authentication
    });
    return response.data; // Return the notes data from the backend
  } catch (error) {
    return handleError(error);
  }
};

// Update an existing note by ID
export const updateNote = async (noteId, title, content, color, token) => {
  try {
    const response = await axiosInstance.put(
      `/notes/notes/${noteId}`, // Backend endpoint to update a specific note
      { title, content, color }, // Data to update
      {
        headers: { Authorization: `Bearer ${token}` }, // Include the token for authentication
      }
    );
    return response.data; // Return the updated note data from the backend
  } catch (error) {
    return handleError(error);
  }
};

// Delete a note by ID
export const deleteNote = async (noteId, token) => {
  try {
    const response = await axiosInstance.delete(`/notes/notes/${noteId}`, {
      headers: { Authorization: `Bearer ${token}` }, // Include the token for authentication
    });
    return response.data; // Return success message from backend
  } catch (error) {
    return handleError(error);
  }
};

const handleError = (error) => {
  if (error.response) {
    // Error received from server response
    const errorMessage =
      error.response?.data?.message || error.response?.data?.error || error.message;
    console.log(errorMessage);
    return {
      success: false,
      error: errorMessage, // Return the error message directly
    };
  } else if (error.request) {
    // No response received from server
    console.error("No response received from server", error.request);
    return {
      success: false,
      error: "No response received from server.",
    };
  } else {
    // Any other error (e.g., Axios setup error)
    console.error("Error in setting up the request", error.message);
    return {
      success: false,
      error: error.message || "An unexpected error occurred.",
    };
  }
};

//api for the  category elements
// Create a new category
export const createCategory = async (name, description, parent_task, children, color, token) => {
  try {
    console.log(name, description, parent_task, children, color, token);
    const response = await axiosInstance.post(
      "/tasks/categories", // Backend endpoint to create a category
      { name, description, parent_task, children, color }, // Data to send to the backend
      {
        headers: { Authorization: `Bearer ${token}` }, // Send token in the headers for authentication
      }
    );
    return response.data; // Return the response from the backend
  } catch (error) {
    console.log(error);
    return handleError(error);
  }
};

// Get all categories for the authenticated user
export const getCategories = async (token) => {
  try {
    const response = await axiosInstance.get("/tasks/categories", {
      headers: { Authorization: `Bearer ${token}` }, // Include the token for authentication
    });
    return response.data; // Return the categories data from the backend
  } catch (error) {
    return handleError(error);
  }
};

// Update an existing category by ID
export const updateCategory = async (
  categoryId,
  name,
  description,
  parent_task,
  children,
  color,
  token
) => {
  try {
    console.log(categoryId);
    const response = await axiosInstance.put(
      `/tasks/categories/${categoryId}`, // Backend endpoint to update a specific category
      { name, description, parent_task, children, color }, // Data to update
      {
        headers: { Authorization: `Bearer ${token}` }, // Include the token for authentication
      }
    );
    return response.data; // Return the updated category data from the backend
  } catch (error) {
    return handleError(error);
  }
};

// Delete a category by ID
export const deleteCategory = async (categoryId, token) => {
  try {
    console.log(categoryId, token);
    const response = await axiosInstance.delete(
      `/tasks/categories/${categoryId}`, // Backend endpoint to delete the category
      {
        headers: { Authorization: `Bearer ${token}` }, // Send token in the headers for authentication
      }
    );
    return response.data; // Return the response from the backend
  } catch (error) {
    console.log(error);
    return handleError(error); // Handle any errors
  }
};

// Common error handler for API requests
