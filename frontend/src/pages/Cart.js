import React, { useContext, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faShoppingBag,
  faArrowRight,
  faArrowLeft,
  faTimes,
  faCalculator,
  faShippingFast,
  faPercent,
  faCreditCard,
  faCheck,
  faMinus,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart } =
    useContext(CartContext);
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Calculate totals
  const subtotal = cartItems.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
  const shipping = subtotal >= 5000 ? 0 : 299;
  const total = subtotal + shipping;

  // Handle quantity change
  const handleQuantityChange = (productId, quantity) => {
    if (quantity < 1) return;

    // Find the item to check stock
    const item = cartItems.find((cartItem) => cartItem.id === productId);
    if (item && item.stockQuantity && quantity > item.stockQuantity) {
      toast.warning(`Only ${item.stockQuantity} available for ${item.name}`, {
        autoClose: 5000,
      });
      return;
    }

    updateQuantity(productId, quantity);
  };

  // Handle quantity increment/decrement
  const handleQuantityIncrement = (productId, currentQuantity) => {
    const item = cartItems.find((cartItem) => cartItem.id === productId);
    if (
      item &&
      item.stockQuantity &&
      currentQuantity + 1 > item.stockQuantity
    ) {
      toast.warning(`Only ${item.stockQuantity} available for ${item.name}`, {
        autoClose: 5000,
      });
      return;
    }
    updateQuantity(productId, currentQuantity + 1);
  };

  const handleQuantityDecrement = (productId, currentQuantity) => {
    if (currentQuantity > 1) {
      updateQuantity(productId, currentQuantity - 1);
    }
  };

  // Handle checkout button click
  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: "/checkout",
          message: "Please login to proceed with checkout",
        },
      });
      return;
    }

    // Check for stock issues before checkout
    const stockIssues = cartItems.filter(
      (item) => item.stockQuantity && item.quantity > item.stockQuantity
    );

    if (stockIssues.length > 0) {
      const productNames = stockIssues.map((item) => item.name).join(", ");
      toast.error(
        `Insufficient stock for: ${productNames}. Please adjust quantities.`,
        { autoClose: 8000 }
      );
      return;
    }

    setLoading(true);
    try {
      // Navigate to checkout with order summary data
      navigate("/checkout", {
        state: {
          orderSummary: {
            subtotal,
            shipping,
            total,
          },
        },
      });
    } catch (error) {
      console.error("Error proceeding to checkout:", error);
      toast.error("Error proceeding to checkout. Please try again.");
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
            Your Shopping Cart
          </h1>
          <p className="login-subtitle" style={{ fontSize: "1.1rem" }}>
            Review your items and proceed to secure checkout
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-5">
            <Card className="login-card shadow-lg border-0">
              <Card.Body className="p-4 p-md-5">
                <div className="mb-4">
                  <FontAwesomeIcon
                    icon={faShoppingBag}
                    size="4x"
                    className="text-muted"
                    style={{ color: "#38e07b" }}
                  />
                </div>
                <h3 className="login-title mb-2">Your cart is empty</h3>
                <p className="login-subtitle mb-4">
                  Looks like you haven't added any products to your cart yet.
                </p>
                <Link to="/shop" className="homepage-btn-main">
                  <FontAwesomeIcon icon={faShoppingBag} className="me-2" />
                  Start Shopping
                </Link>
              </Card.Body>
            </Card>
          </div>
        ) : (
          <Row>
            {/* Cart Items */}
            <Col lg={8} className="mb-4 mb-lg-0">
              <Card className="login-card shadow-lg border-0 mb-4">
                <Card.Body className="p-4 p-md-5">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="login-title mb-0">
                      Cart Items ({cartItems.length})
                    </h2>
                    <Button
                      variant="link"
                      className="text-danger p-0"
                      onClick={clearCart}
                      style={{ textDecoration: "none" }}
                    >
                      <FontAwesomeIcon icon={faTimes} className="me-1" />
                      Clear Cart
                    </Button>
                  </div>

                  <div className="cart-items">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="cart-item mb-4 p-3 border rounded"
                      >
                        <Row className="align-items-center">
                          <Col md={3}>
                            <img
                              src={
                                item.images && item.images.length > 0
                                  ? item.images[0].url
                                  : "/placeholder-product.jpg"
                              }
                              alt={item.name}
                              className="img-fluid rounded"
                              style={{
                                width: "100px",
                                height: "100px",
                                objectFit: "cover",
                                background: "#f8f9fa",
                                minHeight: "100px",
                              }}
                              onError={(e) => {
                                e.target.src = "/placeholder-product.jpg";
                              }}
                              loading="lazy"
                            />
                          </Col>
                          <Col md={4}>
                            <Link
                              to={`/products/${item.id}`}
                              className="text-decoration-none"
                            >
                              <h6
                                className="mb-1 fw-bold"
                                style={{ color: "#0e1a13" }}
                              >
                                {item.name}
                              </h6>
                            </Link>
                            {item.category && (
                              <small className="text-muted">
                                {item.category.name}
                              </small>
                            )}
                            <div className="mt-2">
                              <span
                                className="fw-bold"
                                style={{ color: "#38e07b" }}
                              >
                                ₨{item.price?.toLocaleString()}
                              </span>
                            </div>
                          </Col>
                          <Col md={3}>
                            <div className="quantity-control d-flex align-items-center">
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() =>
                                  handleQuantityDecrement(
                                    item.id,
                                    item.quantity
                                  )
                                }
                                disabled={item.quantity <= 1}
                              >
                                <FontAwesomeIcon icon={faMinus} />
                              </Button>
                              <input
                                type="number"
                                min="1"
                                max={item.stockQuantity || 99}
                                value={item.quantity}
                                onChange={(e) =>
                                  handleQuantityChange(
                                    item.id,
                                    parseInt(e.target.value) || 1
                                  )
                                }
                                className="form-control mx-2 text-center"
                                style={{ width: "60px" }}
                              />
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() =>
                                  handleQuantityIncrement(
                                    item.id,
                                    item.quantity
                                  )
                                }
                                disabled={
                                  item.quantity >= (item.stockQuantity || 99)
                                }
                              >
                                <FontAwesomeIcon icon={faPlus} />
                              </Button>
                            </div>

                            {/* Stock Warning */}
                            {item.stockQuantity &&
                              item.quantity > item.stockQuantity && (
                                <div
                                  className="alert alert-warning mt-2 py-1"
                                  style={{ fontSize: "0.8rem" }}
                                >
                                  <small>
                                    <i className="fas fa-exclamation-triangle me-1"></i>
                                    Only {item.stockQuantity} available
                                  </small>
                                </div>
                              )}

                            {/* Low Stock Warning */}
                            {item.stockQuantity &&
                              item.stockQuantity <= 5 &&
                              item.stockQuantity > 0 && (
                                <div
                                  className="alert alert-info mt-2 py-1"
                                  style={{ fontSize: "0.8rem" }}
                                >
                                  <small>
                                    <i className="fas fa-fire me-1"></i>
                                    Low stock: {item.stockQuantity} remaining
                                  </small>
                                </div>
                              )}
                          </Col>
                          <Col md={2} className="text-end">
                            <div className="mb-2">
                              <span
                                className="fw-bold"
                                style={{ color: "#38e07b" }}
                              >
                                ₨
                                {(item.price * item.quantity)?.toLocaleString()}
                              </span>
                            </div>
                            <Button
                              variant="link"
                              className="text-danger p-0"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </Button>
                          </Col>
                        </Row>
                      </div>
                    ))}
                  </div>

                  <div className="d-flex justify-content-between mt-4">
                    <Link
                      to="/shop"
                      className="homepage-btn-secondary"
                      style={{ textDecoration: "none" }}
                    >
                      <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                      Continue Shopping
                    </Link>
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
                      variant="primary"
                      size="lg"
                      className="homepage-btn-main w-100 mb-3"
                      onClick={handleCheckout}
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
                          <FontAwesomeIcon
                            icon={faCreditCard}
                            className="me-2"
                          />
                          Proceed to Checkout
                        </>
                      )}
                    </Button>

                    {/* Stock Issues Warning */}
                    {cartItems.some(
                      (item) =>
                        item.stockQuantity && item.quantity > item.stockQuantity
                    ) && (
                      <div
                        className="alert alert-warning mt-3 py-2"
                        style={{ fontSize: "0.9rem" }}
                      >
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        <strong>Stock Issues Detected:</strong> Some items have
                        insufficient stock. Please adjust quantities before
                        checkout.
                      </div>
                    )}

                    <div className="text-center">
                      <small className="text-muted d-block">
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
        )}
      </Container>
    </div>
  );
};

export default Cart;
