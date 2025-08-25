import axios from "axios";

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8080", // Use environment variable with fallback
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag to prevent multiple refresh requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors and token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Don't retry refresh token requests to prevent infinite loops
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/api/auth/refresh")
    ) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        // No refresh token available, redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          `${
            process.env.REACT_APP_API_URL || "http://localhost:8080"
          }/api/auth/refresh`,
          {
            refreshToken: refreshToken,
          }
        );

        const { access_token, refresh_token } = response.data;

        // Update tokens in localStorage
        localStorage.setItem("token", access_token);
        localStorage.setItem("refreshToken", refresh_token);

        // Update the original request with new token
        originalRequest.headers.Authorization = `Bearer ${access_token}`;

        // Process queued requests
        processQueue(null, access_token);

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token is invalid or expired
        processQueue(refreshError, null);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Don't redirect on login endpoint failures
    if (
      error.response?.status === 401 &&
      !error.config.url.includes("/api/auth/login")
    ) {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
