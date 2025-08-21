import React, { useState, useEffect, useContext } from "react";
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
import { Link, Navigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faSave,
  faEnvelope,
  faPhone,
  faIdCard,
  faTrash,
  faCalendarAlt,
  faMapMarkerAlt,
  faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";

import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";

const Account = () => {
  const {
    user,
    isAuthenticated,
    loading: authLoading,
    updateProfile,
  } = useContext(AuthContext);

  // Redirect if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ message: "Please log in to access your account" }}
      />
    );
  }

  return (
    <div
      style={{
        background: "#f8fbfa",
        fontFamily: "'Plus Jakarta Sans', 'Noto Sans', sans-serif",
        minHeight: "100vh",
        padding: "2rem 0",
      }}
    >
      <Container>
        <div className="text-center mb-5">
          <h1
            className="login-title mb-2"
            style={{ fontSize: "2.5rem", color: "#0e1a13" }}
          >
            My Account
          </h1>
          <p className="login-subtitle" style={{ fontSize: "1.1rem" }}>
            Manage your profile and account settings
          </p>
        </div>

        {authLoading ? (
          <div className="text-center py-5">
            <Card className="login-card shadow-lg border-0">
              <Card.Body className="p-4 p-md-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">
                  Loading your account information...
                </p>
              </Card.Body>
            </Card>
          </div>
        ) : (
          <Row>
            {/* Account Summary Sidebar */}
            <Col lg={4} className="mb-4">
              <Card className="login-card shadow-lg border-0">
                <Card.Body className="p-4 p-md-5">
                  <div className="text-center mb-4">
                    <div
                      className="avatar-placeholder mb-3 mx-auto rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: 80,
                        height: 80,
                        fontSize: 36,
                        background:
                          "linear-gradient(135deg, #38e07b 0%, #10b981 100%)",
                        color: "white",
                      }}
                    >
                      <span className="fw-bold">
                        {user?.firstName?.charAt(0)}
                        {user?.lastName?.charAt(0)}
                      </span>
                    </div>
                    <h3 className="login-title mb-2">
                      {user?.firstName} {user?.lastName}
                    </h3>
                    <p className="login-subtitle">{user?.email}</p>
                  </div>

                  <div className="account-summary">
                    <div className="summary-item mb-3">
                      <div className="summary-icon">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                      </div>
                      <div className="summary-content">
                        <h6 className="summary-label">Member Since</h6>
                        <p className="summary-value">
                          {user?.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    {user?.phone && (
                      <div className="summary-item mb-3">
                        <div className="summary-icon">
                          <FontAwesomeIcon icon={faPhone} />
                        </div>
                        <div className="summary-content">
                          <h6 className="summary-label">Phone Number</h6>
                          <p className="summary-value">{user.phone}</p>
                        </div>
                      </div>
                    )}

                    {user?.city && (
                      <div className="summary-item">
                        <div className="summary-icon">
                          <FontAwesomeIcon icon={faMapMarkerAlt} />
                        </div>
                        <div className="summary-content">
                          <h6 className="summary-label">Location</h6>
                          <p className="summary-value">
                            {user.city}, {user.state}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Main Content */}
            <Col lg={8}>
              <ProfileTab user={user} updateProfile={updateProfile} />
              <SecurityTab />
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
};

// Profile Tab Component
const ProfileTab = ({ user, updateProfile }) => {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Reset alerts
    setError(null);
    setSuccess(false);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const success = await updateProfile(formData);

    setLoading(false);

    if (success) {
      setSuccess(true);
      toast.success("Profile updated successfully!");
    }
  };

  return (
    <Card className="login-card shadow-lg border-0 mb-4">
      <Card.Body className="p-4 p-md-5">
        <div className="text-center mb-4">
          <h2 className="login-title mb-2">Profile Information</h2>
          <p className="login-subtitle">
            Update your personal details and contact information
          </p>
        </div>

        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-4">
            Your profile has been updated successfully.
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold" style={{ color: "#0e1a13" }}>
                  First Name
                </Form.Label>
                <div className="input-group-custom">
                  <FontAwesomeIcon icon={faUser} className="input-icon" />
                  <Form.Control
                    type="text"
                    name="firstName"
                    placeholder="Enter your first name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="login-input"
                  />
                </div>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold" style={{ color: "#0e1a13" }}>
                  Last Name
                </Form.Label>
                <div className="input-group-custom">
                  <FontAwesomeIcon icon={faIdCard} className="input-icon" />
                  <Form.Control
                    type="text"
                    name="lastName"
                    placeholder="Enter your last name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="login-input"
                  />
                </div>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-4">
            <Form.Label className="fw-bold" style={{ color: "#0e1a13" }}>
              Email Address
            </Form.Label>
            <div className="input-group-custom">
              <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
              <Form.Control
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled
                className="login-input"
                style={{ backgroundColor: "#f8f9fa" }}
              />
            </div>
            <Form.Text className="text-muted">
              Email address cannot be changed for security reasons.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="fw-bold" style={{ color: "#0e1a13" }}>
              Phone Number
            </Form.Label>
            <div className="input-group-custom">
              <FontAwesomeIcon icon={faPhone} className="input-icon" />
              <Form.Control
                type="tel"
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleInputChange}
                className="login-input"
              />
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
                  Saving Changes...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} className="me-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

// Security Tab Component
const SecurityTab = () => {
  return (
    <Card className="login-card shadow-lg border-0">
      <Card.Body className="p-4 p-md-5">
        <div className="text-center mb-4">
          <h2 className="login-title mb-2">Security Settings</h2>
          <p className="login-subtitle">Manage your account security</p>
        </div>

        <div className="delete-account text-center">
          <FontAwesomeIcon
            icon={faShieldAlt}
            size="2x"
            className="text-muted mb-3"
            style={{ color: "#38e07b" }}
          />
          <h4 className="mb-3">Delete Account</h4>
          <p className="text-muted mb-4">
            Once you delete your account, there is no going back. Please be
            certain.
          </p>
          <Button variant="outline-danger">
            <FontAwesomeIcon icon={faTrash} className="me-2" />
            Delete My Account
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default Account;
