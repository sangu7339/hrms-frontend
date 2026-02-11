import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,   // 🔥 Important for nginx proxy
});

export default api;
