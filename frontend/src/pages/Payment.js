import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
  Spinner,
  Badge,
  Modal,
} from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../utils/axios";
import { toast } from "react-toastify";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// Load Stripe (replace with your publishable key)
const stripePromise = loadStripe(
  process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || "pk_test_your_key_here"
);

const PaymentForm = ({ order, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create payment intent on the server
      const {
        data: { clientSecret },
      } = await api.post("/api/payments/create-payment-intent", {
        amount: order.totalAmount,
        currency: "usd",
        orderId: order.id,
        customerEmail: order.user?.email,
      });

      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: order.user?.firstName + " " + order.user?.lastName,
              email: order.user?.email,
            },
          },
        });

      if (stripeError) {
        setError(stripeError.message);
        onError(stripeError.message);
      } else if (paymentIntent.status === "succeeded") {
        // Update order status
        await api.put(`/api/payments/orders/${order.id}/payment-status`, {
          status: "PAID",
          txnRefNumber: paymentIntent.id,
          responseCode: "00",
        });

        onSuccess(paymentIntent);
      }
    } catch (error) {
      console.error("Payment error:", error);
      const errorMessage =
        error.response?.data?.message || "Payment failed. Please try again.";
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#424770",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#9e2146",
      },
    },
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-4">
        <Form.Label className="fw-bold">Card Information</Form.Label>
        <CardElement options={cardElementOptions} />
      </Form.Group>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      <Button
        type="submit"
        variant="primary"
        disabled={!stripe || loading}
        className="w-100"
        style={{ background: "#6366f1", border: "none" }}
      >
        {loading ? (
          <>
            <Spinner animation="border" size="sm" className="me-2" />
            Processing Payment...
          </>
        ) : (
          `Pay $${order.totalAmount}`
        )}
      </Button>
    </Form>
  );
};

const Payment = () => {
  const { user } = useContext(AuthContext);
  const { clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const orderData = location.state?.order;
    if (orderData) {
      setOrder(orderData);
    } else {
      // Redirect to checkout if no order data
      navigate("/checkout");
      return;
    }
    setLoading(false);
  }, [location.state, navigate]);

  const handlePaymentSuccess = (paymentIntent) => {
    setPaymentSuccess(true);
    setShowSuccessModal(true);
    clearCart();
    toast.success("Payment successful! Your order has been confirmed.");
  };

  const handlePaymentError = (error) => {
    toast.error(error);
  };

  const handleContinueShopping = () => {
    navigate("/shop");
  };

  const handleViewOrder = () => {
    navigate("/orders");
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Alert variant="danger">
          No order found. Please complete checkout first.
        </Alert>
      </Container>
    );
  }

  return (
    <div
      className="payment-page d-flex flex-column min-vh-100"
      style={{
        background: "#f8fbfa",
        fontFamily: "'Plus Jakarta Sans', 'Noto Sans', sans-serif",
      }}
    >
      <Container className="flex-grow-1 py-5">
        <Row className="justify-content-center">
          <Col lg={8}>
            <h1
              className="text-center mb-5 fw-bold"
              style={{ color: "#0e1a13", fontSize: "2.5rem" }}
            >
              Complete Your Payment
            </h1>

            <Row>
              {/* Payment Form */}
              <Col lg={7}>
                <Card className="border-0 shadow-sm mb-4">
                  <Card.Header
                    style={{
                      background: "#f8fbfa",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    <h5 className="mb-0">Payment Information</h5>
                  </Card.Header>
                  <Card.Body>
                    <Elements stripe={stripePromise}>
                      <PaymentForm
                        order={order}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                      />
                    </Elements>
                  </Card.Body>
                </Card>

                {/* Security Notice */}
                <Card className="border-0 shadow-sm">
                  <Card.Body className="text-center">
                    <div className="mb-3">
                      <i
                        className="fas fa-shield-alt text-success"
                        style={{ fontSize: "2rem" }}
                      ></i>
                    </div>
                    <h6>Secure Payment</h6>
                    <p className="text-muted small mb-0">
                      Your payment information is encrypted and secure. We use
                      Stripe to process all payments.
                    </p>
                  </Card.Body>
                </Card>
              </Col>

              {/* Order Summary */}
              <Col lg={5}>
                <Card className="border-0 shadow-sm mb-4">
                  <Card.Header
                    style={{
                      background: "#f8fbfa",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    <h5 className="mb-0">Order Summary</h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="mb-3">
                      <strong>Order ID:</strong> #{order.id}
                    </div>

                    <div className="mb-3">
                      <strong>Items:</strong>
                      {order.orderItems?.map((item) => (
                        <div
                          key={item.id}
                          className="d-flex justify-content-between mt-2"
                        >
                          <span className="small">
                            {item.product?.name} x {item.quantity}
                          </span>
                          <span className="small">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <hr />

                    <div className="d-flex justify-content-between mb-2">
                      <span>Subtotal:</span>
                      <span>${order.totalAmount}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Shipping:</span>
                      <span>Free</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Tax:</span>
                      <span>$0.00</span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between fw-bold">
                      <span>Total:</span>
                      <span className="text-primary">${order.totalAmount}</span>
                    </div>
                  </Card.Body>
                </Card>

                {/* Shipping Information */}
                <Card className="border-0 shadow-sm">
                  <Card.Header
                    style={{
                      background: "#f8fbfa",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    <h5 className="mb-0">Shipping Information</h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="mb-2">
                      <strong>
                        {order.user?.firstName} {order.user?.lastName}
                      </strong>
                    </div>
                    <div className="text-muted small">
                      {order.shippingAddress?.street}
                      <br />
                      {order.shippingAddress?.city},{" "}
                      {order.shippingAddress?.state}{" "}
                      {order.shippingAddress?.zipCode}
                      <br />
                      {order.shippingAddress?.country}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>

      {/* Payment Success Modal */}
      <Modal
        show={showSuccessModal}
        onHide={() => setShowSuccessModal(false)}
        centered
      >
        <Modal.Body className="text-center py-5">
          <div className="mb-4">
            <i
              className="fas fa-check-circle text-success"
              style={{ fontSize: "4rem" }}
            ></i>
          </div>
          <h4 className="mb-3">Payment Successful!</h4>
          <p className="text-muted mb-4">
            Your order has been confirmed and will be processed shortly. You
            will receive an email confirmation with order details.
          </p>
          <div className="d-grid gap-2">
            <Button
              variant="primary"
              onClick={handleViewOrder}
              style={{ background: "#6366f1", border: "none" }}
            >
              View Order
            </Button>
            <Button variant="outline-primary" onClick={handleContinueShopping}>
              Continue Shopping
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Payment;
