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
  Table,
  Badge,
} from "react-bootstrap";
import { Link, Navigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faShoppingBag,
  faSave,
  faKey,
  faEnvelope,
  faPhone,
  faIdCard,
  faEye,
  faTrash,
  faCalendarAlt,
  faMapMarkerAlt,
  faCity,
  faGlobe,
  faLock,
  faCheck,
  faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";
import api from "../utils/axios";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";

const Account = () => {
  const {
    user,
    isAuthenticated,
    loading: authLoading,
    updateProfile,
    changePassword,
    logout,
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
            Manage your profile, orders, and account settings
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
                        background: "linear-gradient(135deg, #38e07b 0%, #10b981 100%)",
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
              <OrdersTab />
              <SecurityTab changePassword={changePassword} />
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
    address: user?.address || "",
    city: user?.city || "",
    state: user?.state || "",
    zipCode: user?.zipCode || "",
    country: user?.country || "",
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
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        zipCode: user.zipCode || "",
        country: user.country || "",
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
                <Form.Label
                  className="fw-bold"
                  style={{ color: "#0e1a13" }}
                >
                  Last Name
                </Form.Label>
                <div className="input-group-custom">
                  <FontAwesomeIcon
                    icon={faIdCard}
                    className="input-icon"
                  />
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
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleInputChange}
                className="login-input"
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
                placeholder="Enter your address"
                value={formData.address}
                onChange={handleInputChange}
                className="login-input"
              />
            </div>
          </Form.Group>

          <Row>
            <Col md={4}>
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
                    placeholder="Enter your city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="login-input"
                  />
                </div>
              </Form.Group>
            </Col>
            <Col md={4}>
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
                    placeholder="Enter your state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="login-input"
                  />
                </div>
              </Form.Group>
            </Col>
            <Col md={4}>
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
                    placeholder="Enter ZIP code"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="login-input"
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
                placeholder="Enter your country"
                value={formData.country}
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

// Orders Tab Component
const OrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch orders on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/api/orders");
        setOrders(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("Failed to load your orders. Please try again later.");
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Get status badge variant
  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case "processing":
        return "warning";
      case "shipped":
        return "info";
      case "delivered":
        return "success";
      case "cancelled":
        return "danger";
      default:
        return "secondary";
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Card className="login-card shadow-lg border-0 mb-4">
      <Card.Body className="p-4 p-md-5">
        <div className="text-center mb-4">
          <h2 className="login-title mb-2">Order History</h2>
          <p className="login-subtitle">
            View and track your previous orders
          </p>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Loading your orders...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : orders.length === 0 ? (
          <div className="text-center py-4">
            <FontAwesomeIcon
              icon={faShoppingBag}
              size="3x"
              className="text-muted mb-3"
              style={{ color: "#38e07b" }}
            />
            <h4 className="mb-3">No Orders Yet</h4>
            <p className="mb-4">You haven't placed any orders yet.</p>
            <Link to="/shop" className="homepage-btn-main">
              <FontAwesomeIcon icon={faShoppingBag} className="me-2" />
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover className="align-middle">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{formatDate(order.orderDate)}</td>
                    <td>₨{order.total.toFixed(2)}</td>
                    <td>
                      <Badge bg={getStatusVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </td>
                    <td>
                      <Link
                        to={`/order-confirmation/${order.id}`}
                        className="btn btn-sm btn-outline-primary me-2"
                      >
                        <FontAwesomeIcon icon={faEye} className="me-1" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

// Security Tab Component
const SecurityTab = ({ changePassword }) => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Check password match when either newPassword or confirmPassword changes
    if (name === "newPassword" || name === "confirmPassword") {
      const newPassword = name === "newPassword" ? value : formData.newPassword;
      const confirmPassword =
        name === "confirmPassword" ? value : formData.confirmPassword;
      setPasswordMatch(
        newPassword === confirmPassword || confirmPassword === ""
      );
    }

    // Reset alerts
    setError(null);
    setSuccess(false);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check password match
    if (formData.newPassword !== formData.confirmPassword) {
      setPasswordMatch(false);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    const { currentPassword, newPassword } = formData;
    const success = await changePassword(currentPassword, newPassword);

    setLoading(false);

    if (success) {
      setSuccess(true);
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Password changed successfully!");
    }
  };

  return (
    <Card className="login-card shadow-lg border-0">
      <Card.Body className="p-4 p-md-5">
        <div className="text-center mb-4">
          <h2 className="login-title mb-2">Security Settings</h2>
          <p className="login-subtitle">
            Update your password and manage account security
          </p>
        </div>

        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-4">
            Your password has been changed successfully.
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
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
                name="currentPassword"
                placeholder="Enter your current password"
                value={formData.currentPassword}
                onChange={handleInputChange}
                required
                className="login-input"
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
                name="newPassword"
                placeholder="Enter your new password"
                value={formData.newPassword}
                onChange={handleInputChange}
                required
                minLength="6"
                className="login-input"
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
                name="confirmPassword"
                placeholder="Confirm your new password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                minLength="6"
                className="login-input"
                isInvalid={!passwordMatch}
              />
            </div>
            {!passwordMatch && (
              <Form.Text className="text-danger">
                Passwords do not match.
              </Form.Text>
            )}
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

        <hr className="my-5" />

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
