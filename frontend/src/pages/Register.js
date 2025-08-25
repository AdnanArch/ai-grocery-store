import React, { useState, useContext, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserPlus,
  faUser,
  faEnvelope,
  faLock,
  faPhone,
  faIdCard,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";

const Register = () => {
  const {
    register,
    isAuthenticated,
    error,
    clearError,
    loading: authLoading,
  } = useContext(AuthContext);
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    termsAccepted: false,
  });
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [localError, setLocalError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Clear error on unmount
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Check password match when either password or confirmPassword changes
    if (name === "password" || name === "confirmPassword") {
      const password = name === "password" ? value : formData.password;
      const confirmPassword =
        name === "confirmPassword" ? value : formData.confirmPassword;
      setPasswordMatch(password === confirmPassword || confirmPassword === "");
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    // Check password match
    if (formData.password !== formData.confirmPassword) {
      setPasswordMatch(false);
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

    const { firstName, lastName, email, password, phone } = formData;
    const userData = {
      firstName,
      lastName,
      email,
      password,
      phone,
    };

    try {
      // Send OTP instead of direct registration
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, userData }),
      });

      const data = await response.json();

      if (response.ok) {
        // Show success message and navigate to OTP verification page with user data
        toast.success("OTP sent successfully! Please check your email.");
        navigate("/otp-verification", { state: { userData } });
      } else {
        setLocalError(data.message || "Failed to send OTP. Please try again.");
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      setLocalError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="register-page d-flex flex-column min-vh-100"
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
                Create an Account
              </h2>

              <Form
                noValidate
                validated={validated}
                onSubmit={handleSubmit}
                autoComplete="off"
              >
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group controlId="firstName">
                      <Form.Label>First Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="firstName"
                        placeholder="Enter your first name"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="login-input"
                      />
                      <Form.Control.Feedback type="invalid">
                        Please provide your first name.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group controlId="lastName">
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="lastName"
                        placeholder="Enter your last name"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="login-input"
                      />
                      <Form.Control.Feedback type="invalid">
                        Please provide your last name.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="login-input"
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide a valid email.
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" controlId="phone">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="login-input"
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide your phone number.
                  </Form.Control.Feedback>
                </Form.Group>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group controlId="password">
                      <Form.Label>Password</Form.Label>
                      <div className="input-group-password">
                        <Form.Control
                          type={showPassword ? "text" : "password"}
                          name="password"
                          placeholder="Create a password"
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
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <FontAwesomeIcon
                            icon={showPassword ? faEyeSlash : faEye}
                            style={{ fontSize: "1rem" }}
                          />
                        </button>
                      </div>
                      <Form.Control.Feedback type="invalid">
                        Password must be at least 6 characters.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group controlId="confirmPassword">
                      <Form.Label>Confirm Password</Form.Label>
                      <div className="input-group-password">
                        <Form.Control
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          required
                          className="login-input"
                          isInvalid={!passwordMatch}
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          <FontAwesomeIcon
                            icon={showConfirmPassword ? faEyeSlash : faEye}
                            style={{ fontSize: "1rem" }}
                          />
                        </button>
                      </div>
                      <Form.Control.Feedback type="invalid">
                        Passwords do not match.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-4" controlId="termsAccepted">
                  <Form.Check
                    type="checkbox"
                    name="termsAccepted"
                    label={
                      <span>
                        I agree to the{" "}
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
                      </span>
                    }
                    checked={formData.termsAccepted}
                    onChange={handleInputChange}
                    required
                    feedback="You must agree before submitting."
                    feedbackType="invalid"
                  />
                </Form.Group>
                <Button
                  type="submit"
                  className="homepage-btn-main w-100 mb-3"
                  style={{ fontSize: "1.1rem" }}
                  disabled={loading || authLoading || !formData.termsAccepted}
                >
                  {loading || authLoading
                    ? "Sending OTP..."
                    : "Send Verification Code"}
                </Button>
                <div
                  className="text-center mt-2"
                  style={{ fontSize: 13, color: "#38e07b" }}
                >
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-decoration-underline"
                    style={{ color: "#38e07b" }}
                  >
                    Sign in
                  </Link>
                </div>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Register;
