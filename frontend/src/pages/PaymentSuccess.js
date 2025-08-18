import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Alert,
  Spinner,
  Button,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faTimesCircle,
  faHome,
  faReceipt,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const txnRefNumber = searchParams.get("pp_TxnRefNo");
        const responseCode = searchParams.get("pp_ResponseCode");
        const orderId = searchParams.get("pp_BillReference");

        if (!txnRefNumber || !responseCode) {
          setError("Invalid payment response");
          setLoading(false);
          return;
        }

        // Verify payment with backend
        const response = await axios.put(`/api/payments/orders/${orderId}/payment-status`, {
          txnRefNumber,
          responseCode,
          status: responseCode === "000" ? "PAID" : "FAILED"
        });

        if (response.status === 200) {
          setPaymentStatus("success");
        } else {
          setPaymentStatus("failed");
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        setError("Failed to verify payment status");
        setPaymentStatus("failed");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Verifying your payment...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center p-5">
                <FontAwesomeIcon
                  icon={faTimesCircle}
                  size="4x"
                  className="text-danger mb-4"
                />
                <h3 className="mb-3">Payment Verification Failed</h3>
                <p className="text-muted mb-4">{error}</p>
                <Button
                  variant="primary"
                  onClick={() => navigate("/")}
                  className="me-2"
                >
                  <FontAwesomeIcon icon={faHome} className="me-2" />
                  Go Home
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center p-5">
              {paymentStatus === "success" ? (
                <>
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    size="4x"
                    className="text-success mb-4"
                  />
                  <h3 className="mb-3">Payment Successful!</h3>
                  <p className="text-muted mb-4">
                    Your payment has been processed successfully. You will receive
                    an email confirmation shortly.
                  </p>
                  <div className="d-grid gap-2">
                    <Button
                      variant="primary"
                      onClick={() => navigate("/orders")}
                      className="mb-2"
                    >
                      <FontAwesomeIcon icon={faReceipt} className="me-2" />
                      View Orders
                    </Button>
                    <Button
                      variant="outline-primary"
                      onClick={() => navigate("/")}
                    >
                      <FontAwesomeIcon icon={faHome} className="me-2" />
                      Continue Shopping
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <FontAwesomeIcon
                    icon={faTimesCircle}
                    size="4x"
                    className="text-danger mb-4"
                  />
                  <h3 className="mb-3">Payment Failed</h3>
                  <p className="text-muted mb-4">
                    Unfortunately, your payment could not be processed. Please try
                    again or contact support if the problem persists.
                  </p>
                  <div className="d-grid gap-2">
                    <Button
                      variant="primary"
                      onClick={() => navigate("/cart")}
                      className="mb-2"
                    >
                      Return to Cart
                    </Button>
                    <Button
                      variant="outline-primary"
                      onClick={() => navigate("/")}
                    >
                      <FontAwesomeIcon icon={faHome} className="me-2" />
                      Go Home
                    </Button>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PaymentSuccess;
