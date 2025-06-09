// src/utils/axios.js
import axios from "axios";

const axiosInstance = axios.create({
 baseURL: "https://thriveonbackend-production.up.railway.app/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
