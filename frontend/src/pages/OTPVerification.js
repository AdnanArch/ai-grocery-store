import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
} from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faKey, faClock, faCheck } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import axios from "axios";

const OTPVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userData = location.state?.userData;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);

  // Redirect if no user data
  useEffect(() => {
    if (!userData) {
      navigate("/register");
    }
  }, [userData, navigate]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp([...newOtp, ...Array(6 - newOtp.length).fill("")]);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("/api/auth/verify-otp", {
        email: userData.email,
        otp: otpString,
        userData: userData,
      });

      toast.success("Registration successful! Please login.");
      navigate("/login");
    } catch (error) {
      console.error("OTP verification error:", error);
      const errorMessage =
        error.response?.data?.message || "Invalid OTP. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setLoading(true);
    setError(null);

    try {
      await axios.post("/api/auth/resend-otp", {
        email: userData.email,
        userData: userData,
      });

      setOtp(["", "", "", "", "", ""]);
      setTimeLeft(300);
      setCanResend(false);
      toast.success("OTP resent successfully!");
    } catch (error) {
      console.error("Resend OTP error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to resend OTP. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!userData) {
    return null;
  }

  return (
    <div
      className="otp-verification-page py-5"
      style={{
        background: "#f8fbfa",
        fontFamily: "'Plus Jakarta Sans', 'Noto Sans', sans-serif",
        minHeight: "100vh",
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6} xl={5}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4 p-md-5">
                <div className="text-center mb-4">
                  <div className="mb-3">
                    <FontAwesomeIcon
                      icon={faKey}
                      style={{
                        fontSize: "3rem",
                        color: "#38e07b",
                      }}
                    />
                  </div>
                  <h2
                    className="mb-1 fw-bold"
                    style={{ color: "#0e1a13", fontSize: "2rem" }}
                  >
                    Verify Your Email
                  </h2>
                  <p className="text-muted mb-2">
                    We've sent a 6-digit verification code to
                  </p>
                  <p className="fw-bold" style={{ color: "#38e07b" }}>
                    {userData.email}
                  </p>
                </div>

                <Form onSubmit={handleVerifyOTP}>
                  <div className="mb-4">
                    <Form.Label
                      className="fw-bold"
                      style={{ color: "#0e1a13" }}
                    >
                      Enter Verification Code
                    </Form.Label>
                    <div className="d-flex justify-content-center gap-2 mb-3">
                      {otp.map((digit, index) => (
                        <Form.Control
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          maxLength="1"
                          value={digit}
                          onChange={(e) =>
                            handleOtpChange(index, e.target.value)
                          }
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          onPaste={handlePaste}
                          className="text-center"
                          style={{
                            width: "50px",
                            height: "50px",
                            fontSize: "1.2rem",
                            fontWeight: "600",
                            border: "2px solid #e5e7eb",
                            borderRadius: "12px",
                            background: "white",
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="text-center mb-4">
                    <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                      <FontAwesomeIcon
                        icon={faClock}
                        style={{ color: "#666" }}
                      />
                      <span style={{ color: "#666", fontSize: "0.9rem" }}>
                        Time remaining: {formatTime(timeLeft)}
                      </span>
                    </div>
                    {canResend && (
                      <Button
                        type="button"
                        variant="link"
                        onClick={handleResendOTP}
                        disabled={loading}
                        style={{
                          color: "#38e07b",
                          textDecoration: "none",
                          fontSize: "0.9rem",
                        }}
                      >
                        Resend OTP
                      </Button>
                    )}
                  </div>

                  <div className="d-grid mb-3">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      disabled={loading || otp.join("").length !== 6}
                      style={{
                        background:
                          "linear-gradient(135deg, #38e07b 0%, #10b981 100%)",
                        border: "none",
                        borderRadius: "12px",
                        fontWeight: "600",
                        transition: "all 0.3s ease",
                      }}
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
                          Verifying...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faCheck} className="me-2" />
                          Verify & Create Account
                        </>
                      )}
                    </Button>
                  </div>
                </Form>

                <div className="text-center">
                  <p
                    className="mb-0"
                    style={{ fontSize: "0.9rem", color: "#666" }}
                  >
                    Didn't receive the code?{" "}
                    {canResend ? (
                      <Button
                        type="button"
                        variant="link"
                        onClick={handleResendOTP}
                        disabled={loading}
                        style={{
                          color: "#38e07b",
                          textDecoration: "none",
                          padding: "0",
                          fontSize: "0.9rem",
                        }}
                      >
                        Resend
                      </Button>
                    ) : (
                      <span style={{ color: "#999" }}>
                        Wait {formatTime(timeLeft)} to resend
                      </span>
                    )}
                  </p>
                </div>

                <div className="text-center mt-4">
                  <p
                    className="mb-0"
                    style={{ fontSize: "0.9rem", color: "#666" }}
                  >
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="text-decoration-none"
                      style={{ color: "#38e07b" }}
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default OTPVerification;
