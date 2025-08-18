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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faCity,
  faGlobe,
  faLock,
  faSave,
  faKey,
  faCalendarAlt,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";

const Profile = () => {
  const { user, updateUserProfile } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        zipCode: user.zipCode || "",
        country: user.country || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.put("/api/users/profile", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // Update the user context with new information
      updateUserProfile(response.data);

      setSuccess("Profile updated successfully!");
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(
        err.response?.data?.message ||
          "Failed to update profile. Please try again."
      );
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    // Validate passwords
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setPasswordError(null);
    setPasswordSuccess(null);

    try {
      await axios.put(
        "/api/users/password",
        {
          currentPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setPasswordSuccess("Password updated successfully!");
      toast.success("Password updated successfully!");

      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Error updating password:", err);
      setPasswordError(
        err.response?.data?.message ||
          "Failed to update password. Please try again."
      );
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Row className="w-100">
          <Col md={8} lg={6} xl={5} className="mx-auto">
            <Card className="login-card shadow-lg border-0">
              <Card.Body className="p-4 p-md-5">
                <div className="text-center mb-4">
                  <h2 className="login-title mb-2">Profile Access</h2>
                  <p className="login-subtitle">
                    Please log in to view your profile.
                  </p>
                </div>
                <Alert variant="warning" className="mb-4">
                  You need to be logged in to access your profile.
                </Alert>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
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
            My Profile
          </h1>
          <p className="login-subtitle" style={{ fontSize: "1.1rem" }}>
            Manage your personal information and account settings
          </p>
        </div>

        <Row>
          <Col lg={8}>
            {/* Personal Information Card */}
            <Card className="login-card shadow-lg border-0 mb-4">
              <Card.Body className="p-4 p-md-5">
                <div className="text-center mb-4">
                  <h2 className="login-title mb-2">Personal Information</h2>
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
                    {success}
                  </Alert>
                )}

                <Form onSubmit={handleProfileUpdate}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label
                          className="fw-bold"
                          style={{ color: "#0e1a13" }}
                        >
                          First Name
                        </Form.Label>
                        <div className="input-group-custom">
                          <FontAwesomeIcon
                            icon={faUser}
                            className="input-icon"
                          />
                          <Form.Control
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                            className="login-input"
                            placeholder="Enter your first name"
                          />
                        </div>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label
                          className="fw-bold"
                          style={{ color: "#0e1a13" }}
                        >
                          Last Name
                        </Form.Label>
                        <div className="input-group-custom">
                          <FontAwesomeIcon
                            icon={faUser}
                            className="input-icon"
                          />
                          <Form.Control
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                            className="login-input"
                            placeholder="Enter your last name"
                          />
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-4">
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
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled
                        className="login-input"
                        style={{ backgroundColor: "#f8f9fa" }}
                      />
                    </div>
                    <Form.Text className="text-muted">
                      Email cannot be changed for security reasons.
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label
                      className="fw-bold"
                      style={{ color: "#0e1a13" }}
                    >
                      Phone Number
                    </Form.Label>
                    <div className="input-group-custom">
                      <FontAwesomeIcon icon={faPhone} className="input-icon" />
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="login-input"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label
                      className="fw-bold"
                      style={{ color: "#0e1a13" }}
                    >
                      Address
                    </Form.Label>
                    <div className="input-group-custom">
                      <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        className="input-icon"
                      />
                      <Form.Control
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="login-input"
                        placeholder="Enter your address"
                      />
                    </div>
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label
                          className="fw-bold"
                          style={{ color: "#0e1a13" }}
                        >
                          City
                        </Form.Label>
                        <div className="input-group-custom">
                          <FontAwesomeIcon
                            icon={faCity}
                            className="input-icon"
                          />
                          <Form.Control
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="login-input"
                            placeholder="Enter your city"
                          />
                        </div>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label
                          className="fw-bold"
                          style={{ color: "#0e1a13" }}
                        >
                          State/Province
                        </Form.Label>
                        <div className="input-group-custom">
                          <FontAwesomeIcon
                            icon={faMapMarkerAlt}
                            className="input-icon"
                          />
                          <Form.Control
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            className="login-input"
                            placeholder="Enter your state"
                          />
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label
                          className="fw-bold"
                          style={{ color: "#0e1a13" }}
                        >
                          ZIP/Postal Code
                        </Form.Label>
                        <div className="input-group-custom">
                          <FontAwesomeIcon
                            icon={faMapMarkerAlt}
                            className="input-icon"
                          />
                          <Form.Control
                            type="text"
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleChange}
                            className="login-input"
                            placeholder="Enter ZIP code"
                          />
                        </div>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label
                          className="fw-bold"
                          style={{ color: "#0e1a13" }}
                        >
                          Country
                        </Form.Label>
                        <div className="input-group-custom">
                          <FontAwesomeIcon
                            icon={faGlobe}
                            className="input-icon"
                          />
                          <Form.Control
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            className="login-input"
                            placeholder="Enter your country"
                          />
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>

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
                          Updating Profile...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faSave} className="me-2" />
                          Update Profile
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>

            {/* Change Password Card */}
            <Card className="login-card shadow-lg border-0">
              <Card.Body className="p-4 p-md-5">
                <div className="text-center mb-4">
                  <h2 className="login-title mb-2">Change Password</h2>
                  <p className="login-subtitle">
                    Update your password to keep your account secure
                  </p>
                </div>

                {passwordError && (
                  <Alert variant="danger" className="mb-4">
                    {passwordError}
                  </Alert>
                )}
                {passwordSuccess && (
                  <Alert variant="success" className="mb-4">
                    {passwordSuccess}
                  </Alert>
                )}

                <Form onSubmit={handlePasswordChange}>
                  <Form.Group className="mb-4">
                    <Form.Label
                      className="fw-bold"
                      style={{ color: "#0e1a13" }}
                    >
                      Current Password
                    </Form.Label>
                    <div className="input-group-custom">
                      <FontAwesomeIcon icon={faLock} className="input-icon" />
                      <Form.Control
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        className="login-input"
                        placeholder="Enter your current password"
                      />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label
                      className="fw-bold"
                      style={{ color: "#0e1a13" }}
                    >
                      New Password
                    </Form.Label>
                    <div className="input-group-custom">
                      <FontAwesomeIcon icon={faKey} className="input-icon" />
                      <Form.Control
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                        className="login-input"
                        placeholder="Enter your new password"
                      />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label
                      className="fw-bold"
                      style={{ color: "#0e1a13" }}
                    >
                      Confirm New Password
                    </Form.Label>
                    <div className="input-group-custom">
                      <FontAwesomeIcon icon={faKey} className="input-icon" />
                      <Form.Control
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        className="login-input"
                        placeholder="Confirm your new password"
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
                          Updating Password...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faCheck} className="me-2" />
                          Change Password
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* Account Summary Sidebar */}
          <Col lg={4}>
            <Card className="login-card shadow-lg border-0">
              <Card.Body className="p-4 p-md-5">
                <div className="text-center mb-4">
                  <h2 className="login-title mb-2">Account Summary</h2>
                  <p className="login-subtitle">
                    Your account information at a glance
                  </p>
                </div>

                <div className="account-summary">
                  <div className="summary-item mb-3">
                    <div className="summary-icon">
                      <FontAwesomeIcon icon={faUser} />
                    </div>
                    <div className="summary-content">
                      <h6 className="summary-label">Full Name</h6>
                      <p className="summary-value">
                        {formData.firstName} {formData.lastName}
                      </p>
                    </div>
                  </div>

                  <div className="summary-item mb-3">
                    <div className="summary-icon">
                      <FontAwesomeIcon icon={faEnvelope} />
                    </div>
                    <div className="summary-content">
                      <h6 className="summary-label">Email Address</h6>
                      <p className="summary-value">{formData.email}</p>
                    </div>
                  </div>

                  <div className="summary-item mb-3">
                    <div className="summary-icon">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                    </div>
                    <div className="summary-content">
                      <h6 className="summary-label">Member Since</h6>
                      <p className="summary-value">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  {formData.phone && (
                    <div className="summary-item mb-3">
                      <div className="summary-icon">
                        <FontAwesomeIcon icon={faPhone} />
                      </div>
                      <div className="summary-content">
                        <h6 className="summary-label">Phone Number</h6>
                        <p className="summary-value">{formData.phone}</p>
                      </div>
                    </div>
                  )}

                  {formData.address && (
                    <div className="summary-item">
                      <div className="summary-icon">
                        <FontAwesomeIcon icon={faMapMarkerAlt} />
                      </div>
                      <div className="summary-content">
                        <h6 className="summary-label">Location</h6>
                        <p className="summary-value">
                          {formData.city}, {formData.state}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Profile;
