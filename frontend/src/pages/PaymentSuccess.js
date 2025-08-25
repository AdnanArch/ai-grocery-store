import React, { useState, useEffect, useContext } from "react";
import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faHome,
  faShoppingBag,
} from "@fortawesome/free-solid-svg-icons";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import api from "../utils/axios";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const orderId = searchParams.get("orderId");
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      try {
        if (!orderId) {
          setError("No order ID found");
          setLoading(false);
          return;
        }

        // Update order status to PAID first
        await api.put(`/api/orders/${orderId}/status`, {
          status: "PAID",
        });

        // Fetch order details
        const response = await api.get(`/api/orders/${orderId}`);
        setOrder(response.data);

        // Only clear cart after successful order confirmation
        clearCart();

        toast.success("Payment successful! Your order has been confirmed.");
      } catch (error) {
        console.error("Error processing payment success:", error);
        setError(
          "There was an issue processing your payment. Please contact support."
        );
        toast.error("Error processing payment success");
      } finally {
        setLoading(false);
      }
    };

    // Only run once when component mounts
    if (orderId && !order) {
      handlePaymentSuccess();
    }
  }, [orderId]); // Remove clearCart and sessionId from dependencies

  const handleContinueShopping = () => {
    navigate("/shop");
  };

  const handleViewOrders = () => {
    navigate("/orders");
  };

  const handleGoHome = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div
        className="payment-success-page d-flex flex-column min-vh-100"
        style={{
          background: "#f8fbfa",
          fontFamily: "'Plus Jakarta Sans', 'Noto Sans', sans-serif",
        }}
      >
        <Container className="flex-grow-1 d-flex justify-content-center align-items-center">
          <div className="text-center">
            <Spinner animation="border" role="status" className="mb-3">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <h4>Processing your payment...</h4>
          </div>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="payment-success-page d-flex flex-column min-vh-100"
        style={{
          background: "#f8fbfa",
          fontFamily: "'Plus Jakarta Sans', 'Noto Sans', sans-serif",
        }}
      >
        <Container className="flex-grow-1 py-5">
          <Row className="justify-content-center">
            <Col lg={6}>
              <div className="text-center">
                <h4>Payment Error</h4>
                <p>{error}</p>
                <Button variant="outline-danger" onClick={handleGoHome}>
                  Go Home
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  return (
    <div
      className="payment-success-page d-flex flex-column min-vh-100"
      style={{
        background: "#f8fbfa",
        fontFamily: "'Plus Jakarta Sans', 'Noto Sans', sans-serif",
      }}
    >
      <Container className="flex-grow-1 py-5">
        <Row className="justify-content-center">
          <Col lg={8}>
            <div className="text-center mb-5">
              <FontAwesomeIcon
                icon={faCheckCircle}
                className="text-success"
                style={{ fontSize: "4rem" }}
              />
              <h1
                className="mt-3 mb-3 fw-bold"
                style={{ color: "#0e1a13", fontSize: "2.5rem" }}
              >
                Payment Successful!
              </h1>
              <p className="text-muted fs-5">
                Thank you for your order. We've received your payment and your
                order has been confirmed.
              </p>
            </div>

            {order && (
              <Row>
                <Col lg={6}>
                  <Card className="border-0 shadow-sm mb-4">
                    <Card.Header
                      style={{
                        background: "#f8fbfa",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      <h5 className="mb-0">Order Details</h5>
                    </Card.Header>
                    <Card.Body>
                      <div className="mb-3">
                        <strong>Order ID:</strong> #{order.id}
                      </div>
                      <div className="mb-3">
                        <strong>Order Date:</strong>{" "}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                      <div className="mb-3">
                        <strong>Total Amount:</strong>{" "}
                        <span className="text-success fw-bold">
                          ₨{order.totalAmount}
                        </span>
                      </div>
                      <div className="mb-3">
                        <strong>Status:</strong>{" "}
                        <span className="badge bg-success">Paid</span>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col lg={6}>
                  <Card className="border-0 shadow-sm mb-4">
                    <Card.Header
                      style={{
                        background: "#f8fbfa",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      <h5 className="mb-0">What's Next?</h5>
                    </Card.Header>
                    <Card.Body>
                      <ul className="list-unstyled">
                        <li className="mb-2">
                          <i className="fas fa-envelope text-primary me-2"></i>
                          You'll receive an email confirmation shortly
                        </li>
                        <li className="mb-2">
                          <i className="fas fa-truck text-primary me-2"></i>
                          We'll notify you when your order ships
                        </li>
                        <li className="mb-2">
                          <i className="fas fa-clock text-primary me-2"></i>
                          Estimated delivery: 3-5 business days
                        </li>
                      </ul>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )}

            <div className="text-center">
              <div className="d-grid gap-3 d-md-block">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleViewOrders}
                  className="me-md-2"
                  style={{ background: "#6366f1", border: "none" }}
                >
                  <FontAwesomeIcon icon={faShoppingBag} className="me-2" />
                  View My Orders
                </Button>
                <Button
                  variant="outline-primary"
                  size="lg"
                  onClick={handleContinueShopping}
                  className="me-md-2"
                >
                  <FontAwesomeIcon icon={faHome} className="me-2" />
                  Continue Shopping
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default PaymentSuccess;
