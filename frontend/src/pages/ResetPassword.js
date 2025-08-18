import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faCheck } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const location = useLocation();

  // Get email from query params
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get("email");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [tokenValid, setTokenValid] = useState(true);

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenValid(false);
        setError(
          "Invalid or missing reset token. Please request a new password reset link."
        );
        return;
      }

      try {
        await axios.get(`/api/auth/validate-reset-token/${token}`);
      } catch (error) {
        console.error("Token validation error:", error);
        setTokenValid(false);
        setError(
          "This password reset link is invalid or has expired. Please request a new one."
        );
      }
    };

    validateToken();
  }, [token]);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Check password match when either password or confirmPassword changes
    if (name === "password" || name === "confirmPassword") {
      const password = name === "password" ? value : formData.password;
      const confirmPassword =
        name === "confirmPassword" ? value : formData.confirmPassword;
      setPasswordMatch(
        confirmPassword === "" || password === confirmPassword
      );
    }

    setError(null);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    // Check password match
    if (formData.password !== formData.confirmPassword) {
      setPasswordMatch(false);
      setValidated(true);
      return;
    }

    // Form validation
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setValidated(true);
    setLoading(true);
    setError(null);

    try {
      // Send password reset request to backend
      await axios.post(`/api/auth/reset-password/${token}`, {
        email,
        newPassword: formData.password,
      });

      setSuccess(true);
      toast.success("Password reset successful! Redirecting to login...");

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login", {
          state: {
            message:
              "Your password has been reset successfully. You can now log in with your new password.",
          },
        });
      }, 3000);
    } catch (error) {
      console.error("Password reset error:", error);

      let errorMessage =
        "Failed to reset your password. Please try again later.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // If token is invalid, show error message
  if (!tokenValid) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Row className="w-100">
          <Col md={8} lg={6} xl={5} className="mx-auto">
            <Card className="login-card shadow-lg border-0">
              <Card.Body className="p-4 p-md-5">
                <div className="text-center mb-4">
                  <h2 className="login-title mb-2">Reset Password</h2>
                </div>

                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>

                <div className="text-center mt-4">
                  <Link to="/forgot-password" className="homepage-btn-main">
                    Request New Reset Link
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <Row className="w-100">
        <Col md={8} lg={6} xl={5} className="mx-auto">
          <Card className="login-card shadow-lg border-0">
            <Card.Body className="p-4 p-md-5">
              <div className="text-center mb-4">
                <h2 className="login-title mb-2">Reset Password</h2>
                <p className="login-subtitle">
                  Please enter your new password below.
                </p>
              </div>

              {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>
              )}

              {success ? (
                <Alert variant="success" className="mb-4">
                  <p className="mb-0">
                    Your password has been reset successfully!
                  </p>
                  <p className="mb-0">Redirecting you to the login page...</p>
                </Alert>
              ) : (
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                  <Form.Group className="mb-4" controlId="password">
                    <Form.Label
                      className="fw-bold"
                      style={{ color: "#0e1a13" }}
                    >
                      New Password
                    </Form.Label>
                    <div className="input-group-custom">
                      <FontAwesomeIcon
                        icon={faLock}
                        className="input-icon"
                      />
                      <Form.Control
                        type="password"
                        name="password"
                        placeholder="Enter your new password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        minLength="6"
                        className="login-input"
                        isInvalid={
                          validated &&
                          (!formData.password || formData.password.length < 6)
                        }
                      />
                      <Form.Control.Feedback type="invalid">
                        Password must be at least 6 characters.
                      </Form.Control.Feedback>
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="confirmPassword">
                    <Form.Label
                      className="fw-bold"
                      style={{ color: "#0e1a13" }}
                    >
                      Confirm New Password
                    </Form.Label>
                    <div className="input-group-custom">
                      <FontAwesomeIcon
                        icon={faLock}
                        className="input-icon"
                      />
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm your new password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        className="login-input"
                        isInvalid={!passwordMatch}
                      />
                      <Form.Control.Feedback type="invalid">
                        Passwords do not match.
                      </Form.Control.Feedback>
                    </div>
                  </Form.Group>

                  <div className="d-grid">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      disabled={loading}
                      className="homepage-btn-main w-100 mb-3"
                      style={{ fontSize: "1.1rem" }}
                    >
                      {loading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          Resetting Password...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faCheck} className="me-2" />
                          Reset Password
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              )}

              <div className="text-center mt-4">
                <p className="mb-0">
                  Remember your password?{" "}
                  <Link 
                    to="/login" 
                    className="text-decoration-none"
                    style={{ color: "#38e07b" }}
                  >
                    Back to Login
                  </Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ResetPassword;
