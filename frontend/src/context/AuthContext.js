import React, { createContext, useState, useEffect } from "react";
import api from "../utils/axios";
import { toast } from "react-toastify";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/api/users/me");
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        // If token is invalid, clear it
        if (
          error.response &&
          (error.response.status === 401 || error.response.status === 403)
        ) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      // Don't clear error immediately - let the component handle it
      const response = await api.post("/api/auth/login", { email, password });

      // Handle the backend response format which uses access_token
      const newToken = response.data.access_token;

      if (!newToken) {
        toast.error("Invalid response from server");
        setError("Invalid response from server");
        return false;
      }

      // Save token to localStorage
      localStorage.setItem("token", newToken);
      setToken(newToken);

      // Fetch user data since it's not included in the login response
      try {
        const userResponse = await api.get("/api/users/me");
        setUser(userResponse.data);
      } catch (userError) {
        console.error("Error fetching user data after login:", userError);
        // Continue anyway since we have a valid token
      }

      toast.success("Login successful!", { autoClose: 4000 });
      return true;
    } catch (error) {
      console.error("Login error:", error);
      console.log("Error response:", error.response);
      console.log("Error response data:", error.response?.data);

      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Login failed. Please try again.";
      console.log("Setting error message:", errorMessage);
      console.log("About to show toast for:", errorMessage);

      // Show error toast with explicit configuration
      console.log("Calling toast.error with:", errorMessage);
      toast.error(errorMessage, {
        position: "bottom-right",
        autoClose: 8000, // 8 seconds for errors
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      console.log("Toast should be displayed now");

      // Prevent any automatic redirects for a few seconds
      setTimeout(() => {
        console.log("Toast display time completed");
      }, 3000);

      setError(errorMessage);

      // Clear any existing authentication state on login failure
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);

      return false;
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await api.post("/api/auth/register", userData);
      toast.success("Registration successful! Please login.", {
        autoClose: 4000,
      });
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      toast.error(errorMessage, { autoClose: 8000 });
      setError(errorMessage);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    toast.info("You have been logged out", { autoClose: 4000 });
  };

  const updateProfile = async (userData) => {
    try {
      const response = await api.put("/api/users/profile", userData);
      setUser(response.data);
      toast.success("Profile updated successfully!", { autoClose: 4000 });
      return true;
    } catch (error) {
      console.error("Profile update error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Profile update failed. Please try again.";
      toast.error(errorMessage, { autoClose: 8000 });
      return false;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await api.post("/api/users/change-password", {
        currentPassword,
        newPassword,
      });
      toast.success("Password changed successfully!", { autoClose: 4000 });
      return true;
    } catch (error) {
      console.error("Password change error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Password change failed. Please try again.";
      toast.error(errorMessage, { autoClose: 8000 });
      return false;
    }
  };

  const clearError = () => setError(null);

  // Helper function to check if user is admin
  const isAdmin = user?.roles?.some((role) => role.name === "ROLE_ADMIN");

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
