import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../../context/AuthContext";
import Login from "../Login";
import { toast } from "react-toastify";

// Mock react-toastify
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useLocation: () => ({
    state: { from: "/", message: "" },
  }),
}));

// Mock axios
const mockApi = {
  post: jest.fn(),
  get: jest.fn(),
};

jest.mock("../../utils/axios", () => mockApi);

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe("Login Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });

  describe("Admin Login Scenarios", () => {
    test("Admin login success - should show success toast and redirect to admin dashboard", async () => {
      // Mock successful admin login
      mockApi.post.mockResolvedValueOnce({
        data: { access_token: "admin-token" },
      });

      // Mock user data fetch for admin
      mockApi.get.mockResolvedValueOnce({
        data: {
          id: 1,
          email: "admin@test.com",
          roles: [{ name: "ROLE_ADMIN" }],
        },
      });

      renderLogin();

      // Fill form
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "admin@test.com" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "adminpass123" },
      });

      // Submit form
      fireEvent.click(screen.getByText(/continue/i));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          "Login successful!",
          expect.any(Object)
        );
      });

      // Check redirect after delay
      await waitFor(
        () => {
          expect(mockNavigate).toHaveBeenCalledWith("/admin");
        },
        { timeout: 3000 }
      );
    });

    test("Admin login with invalid password - should show error toast", async () => {
      // Mock failed authentication
      mockApi.post.mockRejectedValueOnce({
        response: {
          data: { error: "Invalid password. Please try again." },
        },
      });

      renderLogin();

      // Fill form
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "admin@test.com" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "wrongpassword" },
      });

      // Submit form
      fireEvent.click(screen.getByText(/continue/i));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          "Invalid password. Please try again.",
          expect.any(Object)
        );
      });

      // Should not redirect
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe("User Login Scenarios", () => {
    test('User login with unregistered email - should show "register first" toast', async () => {
      // Mock user not found error
      mockApi.post.mockRejectedValueOnce({
        response: {
          data: { error: "Account does not exist. Please register first." },
        },
      });

      renderLogin();

      // Fill form
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "newuser@test.com" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "password123" },
      });

      // Submit form
      fireEvent.click(screen.getByText(/continue/i));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          "Account does not exist. Please register first.",
          expect.any(Object)
        );
      });

      // Should not redirect
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    test("User login with invalid password - should show error toast", async () => {
      // Mock invalid password error
      mockApi.post.mockRejectedValueOnce({
        response: {
          data: { error: "Invalid password. Please try again." },
        },
      });

      renderLogin();

      // Fill form
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "user@test.com" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "wrongpass" },
      });

      // Submit form
      fireEvent.click(screen.getByText(/continue/i));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          "Invalid password. Please try again.",
          expect.any(Object)
        );
      });

      // Should not redirect
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    test("User login with deactivated account - should show deactivation toast", async () => {
      // Mock account deactivated error
      mockApi.post.mockRejectedValueOnce({
        response: {
          data: {
            error:
              "Your account has been deactivated. Please contact an administrator.",
          },
        },
      });

      renderLogin();

      // Fill form
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "deactivated@test.com" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "password123" },
      });

      // Submit form
      fireEvent.click(screen.getByText(/continue/i));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          "Your account has been deactivated. Please contact an administrator.",
          expect.any(Object)
        );
      });

      // Should not redirect
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    test("Regular user login success - should show success toast and redirect to intended page", async () => {
      // Mock successful user login
      mockApi.post.mockResolvedValueOnce({
        data: { access_token: "user-token" },
      });

      // Mock user data fetch for regular user
      mockApi.get.mockResolvedValueOnce({
        data: {
          id: 2,
          email: "user@test.com",
          roles: [{ name: "ROLE_USER" }],
        },
      });

      renderLogin();

      // Fill form
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "user@test.com" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "userpass123" },
      });

      // Submit form
      fireEvent.click(screen.getByText(/continue/i));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          "Login successful!",
          expect.any(Object)
        );
      });

      // Check redirect after delay
      await waitFor(
        () => {
          expect(mockNavigate).toHaveBeenCalledWith("/");
        },
        { timeout: 3000 }
      );
    });
  });

  describe("Form Validation", () => {
    test("Empty form submission - should show validation errors", () => {
      renderLogin();

      // Submit empty form
      fireEvent.click(screen.getByText(/continue/i));

      // Check for validation messages
      expect(
        screen.getByText(/please provide a valid email/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/please provide your password/i)
      ).toBeInTheDocument();
    });

    test("Invalid email format - should show validation error", () => {
      renderLogin();

      // Fill with invalid email
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "invalid-email" },
      });

      // Submit form
      fireEvent.click(screen.getByText(/continue/i));

      expect(
        screen.getByText(/please provide a valid email/i)
      ).toBeInTheDocument();
    });

    test("Password too short - should show validation error", () => {
      renderLogin();

      // Fill with short password
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "123" },
      });

      // Submit form
      fireEvent.click(screen.getByText(/continue/i));

      expect(
        screen.getByText(/please provide your password/i)
      ).toBeInTheDocument();
    });
  });

  describe("Loading States", () => {
    test("Should show loading state during login", async () => {
      // Mock slow API response
      mockApi.post.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      renderLogin();

      // Fill form
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "password123" },
      });

      // Submit form
      fireEvent.click(screen.getByText(/continue/i));

      // Check loading state
      expect(screen.getByText(/logging in/i)).toBeInTheDocument();
      expect(screen.getByText(/logging in/i)).toBeDisabled();
    });
  });

  describe("Network Errors", () => {
    test("Network error - should show generic error toast", async () => {
      // Mock network error
      mockApi.post.mockRejectedValueOnce(new Error("Network Error"));

      renderLogin();

      // Fill form
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "password123" },
      });

      // Submit form
      fireEvent.click(screen.getByText(/continue/i));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          "Login failed. Please try again.",
          expect.any(Object)
        );
      });
    });
  });
});
