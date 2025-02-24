// src/utils/axios.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080/api", // Your backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
