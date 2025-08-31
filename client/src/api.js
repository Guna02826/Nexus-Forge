import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API = axios.create({
  baseURL: process.env.BASE_URL,
});

// Attach JWT automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
