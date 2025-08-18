import React, { useState } from "react";
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
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faCheck } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { toast } from "react-toastify";

const RequestResetPassword = () => {
  const [formData, setFormData] = useState({
    email: "",
  });
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError(null);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

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
      await axios.post("/api/auth/forgot-password", {
        email: formData.email,
      });

      setSuccess(true);
      toast.success("Password reset link sent to your email!");
    } catch (error) {
      console.error("Password reset request error:", error);

      let errorMessage =
        "Failed to send password reset email. Please try again later.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <Row className="w-100">
        <Col md={8} lg={6} xl={5} className="mx-auto">
          <Card className="login-card shadow-lg border-0">
            <Card.Body className="p-4 p-md-5">
              <div className="text-center mb-4">
                <h2 className="login-title mb-2">Reset Password</h2>
                <p className="login-subtitle">
                  Enter your email address and we'll send you a link to reset
                  your password.
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
                    Password reset link has been sent to your email address!
                  </p>
                  <p className="mb-0">
                    Please check your inbox and follow the instructions to reset
                    your password.
                  </p>
                </Alert>
              ) : (
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                  <Form.Group className="mb-4" controlId="email">
                    <Form.Label
                      className="fw-bold"
                      style={{ color: "#0e1a13" }}
                    >
                      Email Address
                    </Form.Label>
                    <div className="input-group-custom">
                      <FontAwesomeIcon
                        icon={faEnvelope}
                        className="input-icon"
                      />
                      <Form.Control
                        type="email"
                        name="email"
                        placeholder="Enter your email address"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="login-input"
                        isInvalid={
                          validated &&
                          (!formData.email || !formData.email.includes("@"))
                        }
                      />
                      <Form.Control.Feedback type="invalid">
                        Please enter a valid email address.
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
                          Sending Reset Link...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faCheck} className="me-2" />
                          Send Reset Link
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RequestResetPassword;
