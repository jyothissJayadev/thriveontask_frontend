// src/utils/axios.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "thriveonbackend-production.up.railway.app/api", // Your backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
