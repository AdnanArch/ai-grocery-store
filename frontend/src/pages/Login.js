import React, { useState, useContext, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const {
    login,
    isAuthenticated,
    loading: authLoading,
    user,
    isAdmin,
  } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);

  // Get redirect path from location state or default to home
  const from = location.state?.from || "/";
  const message = location.state?.message || "";

  // Only redirect if already authenticated when component mounts
  useEffect(() => {
    // Only redirect if user is already authenticated and we're not in the middle of a login attempt
    if (
      isAuthenticated &&
      !loading &&
      !formData.email &&
      !formData.password &&
      !validated
    ) {
      // Add a small delay to ensure any error messages are displayed
      setTimeout(() => {
        navigate(from);
      }, 100);
    }
  }, [
    isAuthenticated,
    navigate,
    from,
    loading,
    formData.email,
    formData.password,
    validated,
  ]);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    setValidated(true);
    setLoading(true);
    const { email, password } = formData;
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      // Add a delay to allow toast notification to be visible
      setTimeout(() => {
        // Check if user is admin and redirect accordingly
        if (isAdmin) {
          navigate("/admin");
        } else {
          navigate(from);
        }
      }, 1500); // 1.5 second delay
    } else {
      // Add a delay to prevent page reload and allow error toast to be visible
      setTimeout(() => {
        // Keep user on login page to see error message
      }, 3000); // 3 second delay for error cases
    }
    // Don't reset the form on error - let the user see the error message
    // and keep their input for correction
  };

  return (
    <div
      className="login-page d-flex flex-column min-vh-100"
      style={{
        background: "#f8fbfa",
        fontFamily: "'Plus Jakarta Sans', 'Noto Sans', sans-serif",
      }}
    >
      <Container className="flex-grow-1 d-flex flex-column justify-content-center align-items-center py-5">
        <Row className="w-100 justify-content-center">
          <Col xs={12} md={8} lg={6} xl={5} className="px-0">
            <div className="p-0" style={{ background: "transparent" }}>
              <h2
                className="text-center fw-bold mb-4"
                style={{ fontSize: 28, color: "#0e1a13" }}
              >
                Sign in or create an account
              </h2>
              {message && (
                <Alert variant="info" className="mb-4">
                  {message}
                </Alert>
              )}

              <Form
                noValidate
                validated={validated}
                onSubmit={handleSubmit}
                autoComplete="off"
              >
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label className="fw-bold" style={{ color: "#0e1a13" }}>
                    Email
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="login-input"
                    autoComplete="username"
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide a valid email.
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" controlId="password">
                  <Form.Label className="fw-bold" style={{ color: "#0e1a13" }}>
                    Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="login-input"
                    minLength="6"
                    autoComplete="current-password"
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide your password (min 6 characters).
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Forgot Password Link */}
                <div className="d-flex justify-content-end mb-3">
                  <Link
                    to="/forgot-password"
                    className="text-decoration-none"
                    style={{ color: "#38e07b", fontSize: "0.9rem" }}
                  >
                    Forgot Password?
                  </Link>
                </div>

                <div className="d-flex align-items-center mb-4">
                  <Form.Check
                    type="switch"
                    id="rememberMe"
                    name="rememberMe"
                    label="Remember me"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="login-switch"
                  />
                </div>
                <Button
                  type="submit"
                  className="homepage-btn-main w-100 mb-3"
                  style={{ fontSize: "1.1rem" }}
                  disabled={loading || authLoading}
                >
                  {loading || authLoading ? "Loading..." : "Continue"}
                </Button>

                <div
                  className="text-center mt-2"
                  style={{ fontSize: 13, color: "#38e07b" }}
                >
                  By continuing, you agree to our{" "}
                  <Link
                    to="/terms"
                    className="text-decoration-underline"
                    style={{ color: "#38e07b" }}
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy-policy"
                    className="text-decoration-underline"
                    style={{ color: "#38e07b" }}
                  >
                    Privacy Policy
                  </Link>
                </div>
                <div
                  className="text-center mt-3"
                  style={{ fontSize: 14, color: "#666" }}
                >
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="text-decoration-underline"
                    style={{ color: "#38e07b" }}
                  >
                    Sign up
                  </Link>
                </div>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        limit={3}
        theme="colored"
      />
    </div>
  );
};

export default Login;
