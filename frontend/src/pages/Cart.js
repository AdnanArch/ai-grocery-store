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
  const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart } =
    useContext(CartContext);
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Calculate order summary values
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 5000 ? 0 : 299; // Free shipping over Rs. 5000
  const tax = subtotal * 0.04; // 4% tax
  const total = subtotal + shipping + tax;

  // Handle quantity change
  const handleQuantityChange = (productId, quantity) => {
    if (quantity < 1) return;
    updateQuantity(productId, quantity);
  };

  // Handle quantity increment/decrement
  const handleQuantityIncrement = (productId, currentQuantity) => {
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

    setLoading(true);
    try {
      // Navigate to checkout with order summary data
      navigate("/checkout", {
        state: {
          orderSummary: {
            subtotal,
            shipping,
            tax,
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
                              }}
                              onError={(e) => {
                                e.target.src = "/placeholder-product.jpg";
                              }}
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
                              >
                                <FontAwesomeIcon icon={faPlus} />
                              </Button>
                            </div>
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
                    <div className="summary-item mb-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="summary-label flex-grow-0">
                          <FontAwesomeIcon
                            icon={faCalculator}
                            className="me-2"
                          />
                          Subtotal
                        </span>
                        <span className="summary-value flex-grow-0 ms-auto">
                          ₨{subtotal.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="summary-item mb-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="summary-label flex-grow-0">
                          <FontAwesomeIcon
                            icon={faShippingFast}
                            className="me-2"
                          />
                          Shipping
                        </span>
                        <span className="summary-value flex-grow-0 ms-auto">
                          {shipping === 0 ? (
                            <span className="text-success">Free</span>
                          ) : (
                            `₨${shipping.toLocaleString()}`
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="summary-item mb-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="summary-label flex-grow-0">
                          <FontAwesomeIcon icon={faPercent} className="me-2" />
                          Tax (4%)
                        </span>
                        <span className="summary-value flex-grow-0 ms-auto">
                          ₨{tax.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <hr />

                    <div className="summary-item mb-4">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="summary-label fw-bold flex-grow-0">
                          Total
                        </span>
                        <span
                          className="summary-value fw-bold flex-grow-0 ms-auto"
                          style={{ color: "#38e07b", fontSize: "1.2rem" }}
                        >
                          ₨{total.toLocaleString()}
                        </span>
                      </div>
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
