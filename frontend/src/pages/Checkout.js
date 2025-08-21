import React, { useState, useContext, useEffect } from "react";
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
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCreditCard,
  faShieldAlt,
  faLock,
  faCheck,
  faUser,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faCity,
  faGlobe,
  faCalculator,
  faShippingFast,
  faPercent,
} from "@fortawesome/free-solid-svg-icons";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import api from "../utils/axios";

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, cartTotal, clearCart } = useContext(CartContext);
  const { isAuthenticated, user } = useContext(AuthContext);

  // Get order summary from cart page
  const orderSummary = location.state?.orderSummary;

  // Form states
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form data
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    city: user?.city || "",
    state: user?.state || "",
    zipCode: user?.zipCode || "",
    country: "Pakistan",
    saveInfo: true,
  });

  // Use order summary from cart or calculate default values
  const subtotal =
    orderSummary?.subtotal ||
    cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const shipping = orderSummary?.shipping || (subtotal > 5000 ? 0 : 299);
  const tax = orderSummary?.tax || subtotal * 0.15;
  const discount = orderSummary?.discount || 0;
  const total = orderSummary?.total || subtotal + shipping + tax - discount;

  // Redirect if not authenticated or cart is empty
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: "/checkout",
          message: "Please login to proceed with checkout",
        },
      });
    } else if (cartItems.length === 0) {
      navigate("/cart", { state: { message: "Your cart is empty" } });
    }
  }, [isAuthenticated, cartItems, navigate]);

  // Handle form input changes
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

    // Form validation
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setValidated(true);
    setLoading(true);
    setError("");

    try {
      // Prepare order data
      const orderData = {
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
          phone: formData.phone,
        },
        orderItems: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        paymentMethod: "stripe",
        subtotal,
        shippingCost: shipping,
        tax,
        discount,
        total,
        couponCode: orderSummary?.couponCode || null,
      };

      // Send order to API
      const response = await api.post("/api/orders", orderData);

      // Create Stripe checkout session
      const checkoutResponse = await api.post(
        "/api/payments/create-checkout-session",
        {
          orderId: response.data.id,
          amount: total,
          currency: "pkr",
          customerEmail: formData.email,
          successUrl: `${window.location.origin}/payment-success?orderId=${response.data.id}`,
          cancelUrl: `${window.location.origin}/checkout`,
        }
      );

      // Redirect to Stripe checkout
      if (checkoutResponse.data.success && checkoutResponse.data.url) {
        // Check if currency was converted
        if (
          checkoutResponse.data.originalCurrency === "pkr" &&
          checkoutResponse.data.currency === "usd"
        ) {
          toast.info(
            `Payment will be processed in USD (${checkoutResponse.data.convertedAmount}) instead of PKR (${checkoutResponse.data.originalAmount}) due to currency restrictions.`
          );
        }
        window.location.href = checkoutResponse.data.url;
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Error creating order:", error);

      // Handle specific error cases
      if (error.response?.data?.message?.includes("insufficient stock")) {
        setError(
          "Some items in your order have insufficient stock. Please return to cart and adjust quantities."
        );
        toast.error(
          "Some items have insufficient stock. Please check your cart."
        );
      } else {
        setError(
          "There was a problem processing your order. Please try again."
        );
        toast.error("Error creating order. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

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
            Checkout
          </h1>
          <p className="login-subtitle" style={{ fontSize: "1.1rem" }}>
            Complete your purchase with secure payment
          </p>
        </div>

        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Row>
            {/* Shipping & Payment Form */}
            <Col lg={8} className="mb-4 mb-lg-0">
              <Card className="login-card shadow-lg border-0 mb-4">
                <Card.Body className="p-4 p-md-5">
                  <div className="text-center mb-4">
                    <h2 className="login-title mb-2">Shipping Information</h2>
                    <p className="login-subtitle">
                      Where should we deliver your order?
                    </p>
                  </div>

                  <Row>
                    <Col md={6} className="mb-4">
                      <Form.Group controlId="firstName">
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
                            onChange={handleInputChange}
                            required
                            className="login-input"
                          />
                        </div>
                        <Form.Control.Feedback type="invalid">
                          Please provide your first name.
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={6} className="mb-4">
                      <Form.Group controlId="lastName">
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
                            onChange={handleInputChange}
                            required
                            className="login-input"
                          />
                        </div>
                        <Form.Control.Feedback type="invalid">
                          Please provide your last name.
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6} className="mb-4">
                      <Form.Group controlId="email">
                        <Form.Label
                          className="fw-bold"
                          style={{ color: "#0e1a13" }}
                        >
                          Email
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
                            onChange={handleInputChange}
                            required
                            className="login-input"
                          />
                        </div>
                        <Form.Control.Feedback type="invalid">
                          Please provide a valid email.
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={6} className="mb-4">
                      <Form.Group controlId="phone">
                        <Form.Label
                          className="fw-bold"
                          style={{ color: "#0e1a13" }}
                        >
                          Phone Number
                        </Form.Label>
                        <div className="input-group-custom">
                          <FontAwesomeIcon
                            icon={faPhone}
                            className="input-icon"
                          />
                          <Form.Control
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            className="login-input"
                          />
                        </div>
                        <Form.Control.Feedback type="invalid">
                          Please provide your phone number.
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-4" controlId="address">
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
                        onChange={handleInputChange}
                        required
                        className="login-input"
                      />
                    </div>
                    <Form.Control.Feedback type="invalid">
                      Please provide your address.
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Row>
                    <Col md={4} className="mb-4">
                      <Form.Group controlId="city">
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
                            onChange={handleInputChange}
                            required
                            className="login-input"
                          />
                        </div>
                        <Form.Control.Feedback type="invalid">
                          Please provide your city.
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={4} className="mb-4">
                      <Form.Group controlId="state">
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
                            onChange={handleInputChange}
                            required
                            className="login-input"
                          />
                        </div>
                        <Form.Control.Feedback type="invalid">
                          Please provide your state.
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={4} className="mb-4">
                      <Form.Group controlId="zipCode">
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
                            onChange={handleInputChange}
                            required
                            className="login-input"
                          />
                        </div>
                        <Form.Control.Feedback type="invalid">
                          Please provide your zip code.
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-4" controlId="country">
                    <Form.Label
                      className="fw-bold"
                      style={{ color: "#0e1a13" }}
                    >
                      Country
                    </Form.Label>
                    <div className="input-group-custom">
                      <FontAwesomeIcon icon={faGlobe} className="input-icon" />
                      <Form.Select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        required
                        className="login-input"
                        style={{ paddingLeft: "3rem" }}
                      >
                        <option value="Pakistan">Pakistan</option>
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Australia">Australia</option>
                      </Form.Select>
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-0">
                    <Form.Check
                      type="checkbox"
                      id="saveInfo"
                      name="saveInfo"
                      label="Save this information for next time"
                      checked={formData.saveInfo}
                      onChange={handleInputChange}
                      className="login-switch"
                    />
                  </Form.Group>
                </Card.Body>
              </Card>

              <Card className="login-card shadow-lg border-0">
                <Card.Body className="p-4 p-md-5">
                  <div className="text-center mb-4">
                    <h2 className="login-title mb-2">Payment Method</h2>
                    <p className="login-subtitle">Secure payment with Stripe</p>
                  </div>

                  <div className="payment-methods mb-4">
                    <div className="payment-method-selected p-3 border rounded">
                      <div className="d-flex align-items-center">
                        <FontAwesomeIcon
                          icon={faCreditCard}
                          className="me-3"
                          style={{ color: "#38e07b", fontSize: "1.5rem" }}
                        />
                        <div>
                          <h6 className="mb-1">Credit/Debit Card</h6>
                          <p className="text-muted mb-0 small">
                            Secure payment powered by Stripe
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-muted small">
                    <FontAwesomeIcon icon={faLock} className="me-1" />
                    Your payment information is encrypted and secure. We use
                    Stripe to process all payments.
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Order Summary */}
            <Col lg={4}>
              <Card className="login-card shadow-lg border-0 mb-4">
                <Card.Body className="p-4 p-md-5">
                  <div className="text-center mb-4">
                    <h2 className="login-title mb-2">Order Summary</h2>
                    <p className="login-subtitle">
                      Complete breakdown of your order
                    </p>
                  </div>

                  <div className="order-items mb-4">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="d-flex justify-content-between mb-3 p-2 border rounded"
                      >
                        <div>
                          <span className="fw-bold">{item.quantity}x</span>{" "}
                          {item.name}
                        </div>
                        <span className="fw-bold" style={{ color: "#38e07b" }}>
                          ₨{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  <hr />

                  <div className="order-summary">
                    <div className="summary-item">
                      <div className="d-flex align-items-center">
                        <FontAwesomeIcon icon={faCalculator} className="me-2" />
                        <span className="summary-label">Subtotal</span>
                      </div>
                      <span className="summary-value">
                        ₨{subtotal.toLocaleString()}
                      </span>
                    </div>

                    <div className="summary-item">
                      <div className="d-flex align-items-center">
                        <FontAwesomeIcon
                          icon={faShippingFast}
                          className="me-2"
                        />
                        <span className="summary-label">Shipping</span>
                      </div>
                      <span className="summary-value">
                        {shipping === 0 ? (
                          <span className="text-success">Free</span>
                        ) : (
                          `₨${shipping.toLocaleString()}`
                        )}
                      </span>
                    </div>

                    <div className="summary-item">
                      <div className="d-flex align-items-center">
                        <FontAwesomeIcon icon={faPercent} className="me-2" />
                        <span className="summary-label">Tax (15%)</span>
                      </div>
                      <span className="summary-value">
                        ₨{tax.toLocaleString()}
                      </span>
                    </div>

                    {discount > 0 && (
                      <div className="summary-item">
                        <div className="d-flex align-items-center">
                          <FontAwesomeIcon icon={faCheck} className="me-2" />
                          <span className="summary-label">Discount</span>
                        </div>
                        <span className="summary-value text-success">
                          -₨{discount.toLocaleString()}
                        </span>
                      </div>
                    )}

                    <hr />

                    <div className="summary-item">
                      <span className="summary-label fw-bold">Total</span>
                      <span
                        className="summary-value fw-bold"
                        style={{ color: "#38e07b", fontSize: "1.2rem" }}
                      >
                        ₨{total.toLocaleString()}
                      </span>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="homepage-btn-main w-100"
                      disabled={loading}
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
                          Processing...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faLock} className="me-2" />
                          Proceed to Payment
                        </>
                      )}
                    </Button>

                    <div className="text-center mt-3">
                      <small className="text-muted d-block">
                        <FontAwesomeIcon icon={faShieldAlt} className="me-1" />
                        Secure Checkout
                      </small>
                      <small className="text-muted d-block mt-2">
                        {shipping === 0
                          ? "Free shipping applied!"
                          : `Free shipping on orders over ₨5,000. You're ₨${Math.max(
                              0,
                              5000 - subtotal
                            ).toLocaleString()} away.`}
                      </small>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Form>
      </Container>
    </div>
  );
};

export default Checkout;
