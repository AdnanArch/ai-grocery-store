import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Spinner,
  Table,
} from "react-bootstrap";
import { Link, useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faFileInvoice,
  faShoppingBag,
  faArrowLeft,
  faMapMarkerAlt,
  faTruck,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

const OrderConfirmation = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await axios.get(`/api/orders/${id}`);
        setOrder(response.data);
      } catch (error) {
        console.error("Error fetching order details:", error);
        setError("Failed to load order details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading order details...</p>
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error || "Order not found"}</Alert>
        <Button
          variant="outline-primary"
          onClick={() => navigate("/account/orders")}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Back to Orders
        </Button>
      </Container>
    );
  }

  // Calculate order summary
  const subtotal =
    order.subtotal ||
    order.orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = order.shippingCost || 0;
  const tax = order.tax || 0;
  const total = order.total || subtotal + shipping + tax;

  return (
    <div
      className="order-confirmation-page py-5"
      style={{
        background: "#f8fbfa",
        fontFamily: "'Plus Jakarta Sans', 'Noto Sans', sans-serif",
        minHeight: "100vh",
      }}
    >
      <Container>
        <div className="text-center mb-5">
          <div className="mb-4">
            <FontAwesomeIcon
              icon={faCheckCircle}
              size="4x"
              className="text-success"
            />
          </div>
          <h1>Thank You for Your Order!</h1>
          <p className="lead mb-0">
            Your order has been received and is being processed.
          </p>
          <p className="text-muted">
            A confirmation email has been sent to{" "}
            {order.user?.email || "your email address"}.
          </p>
        </div>

        <Row className="mb-4">
          <Col md={6} className="mb-4 mb-md-0">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <div className="d-flex align-items-center mb-3">
                  <FontAwesomeIcon
                    icon={faFileInvoice}
                    className="text-primary me-2"
                  />
                  <h5 className="mb-0">Order Details</h5>
                </div>

                <Row className="mb-3">
                  <Col xs={4} className="text-muted">
                    Order Number:
                  </Col>
                  <Col xs={8} className="fw-bold">
                    {order.id}
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col xs={4} className="text-muted">
                    Order Date:
                  </Col>
                  <Col xs={8}>{formatDate(order.orderDate || new Date())}</Col>
                </Row>

                <Row className="mb-3">
                  <Col xs={4} className="text-muted">
                    Status:
                  </Col>
                  <Col xs={8}>
                    <span className="badge bg-success">
                      {order.status || "Processing"}
                    </span>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col xs={4} className="text-muted">
                    Payment Method:
                  </Col>
                  <Col xs={8}>
                    {order.paymentMethod === "credit_card"
                      ? "Credit Card"
                      : "PayPal"}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <div className="d-flex align-items-center mb-3">
                  <FontAwesomeIcon
                    icon={faMapMarkerAlt}
                    className="text-primary me-2"
                  />
                  <h5 className="mb-0">Shipping Address</h5>
                </div>

                {order.shippingAddress ? (
                  <address className="mb-0">
                    <strong>
                      {order.shippingAddress.firstName}{" "}
                      {order.shippingAddress.lastName}
                    </strong>
                    <br />
                    {order.shippingAddress.address}
                    <br />
                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                    {order.shippingAddress.zipCode}
                    <br />
                    {order.shippingAddress.country}
                    <br />
                    <abbr title="Phone">P:</abbr> {order.shippingAddress.phone}
                  </address>
                ) : (
                  <p className="text-muted">No shipping address provided</p>
                )}

                <div className="mt-3">
                  <div className="d-flex align-items-center">
                    <FontAwesomeIcon
                      icon={faTruck}
                      className="text-primary me-2"
                    />
                    <span>
                      Estimated Delivery:{" "}
                      {formatDate(
                        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                      )}
                    </span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <h5 className="mb-4">Order Items</h5>

            <div className="table-responsive">
              <Table className="align-middle">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.orderItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img
                            src={
                              item.product?.images &&
                              item.product.images.length > 0
                                ? item.product.images[0].url
                                : `https://source.unsplash.com/100x100/?${
                                    item.product?.name.toLowerCase() ||
                                    "grocery"
                                  }`
                            }
                            alt={item.product?.name || "Product"}
                            className="order-item-img rounded me-3"
                            style={{
                              width: "50px",
                              height: "50px",
                              objectFit: "cover",
                            }}
                          />
                          <div>
                            <h6 className="mb-0">
                              {item.product?.name || "Product"}
                            </h6>
                            {item.product?.category && (
                              <small className="text-muted">
                                {item.product.category.name}
                              </small>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>${item.price?.toFixed(2) || "0.00"}</td>
                      <td>{item.quantity}</td>
                      <td className="fw-bold">
                        ${((item.price || 0) * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            <div className="order-summary mt-4">
              <Row>
                <Col md={6} className="ms-auto">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>

                  <div className="d-flex justify-content-between mb-2">
                    <span>Shipping</span>
                    <span>
                      {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>

                  <div className="d-flex justify-content-between mb-2">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>

                  <hr />

                  <div className="d-flex justify-content-between mb-0">
                    <span className="fw-bold">Total</span>
                    <span className="fw-bold h5 mb-0">${total.toFixed(2)}</span>
                  </div>
                </Col>
              </Row>
            </div>
          </Card.Body>
        </Card>

        <div className="text-center">
          <Link to="/shop" className="btn btn-primary me-2">
            <FontAwesomeIcon icon={faShoppingBag} className="me-2" />
            Continue Shopping
          </Link>
          <Link to="/account/orders" className="btn btn-outline-primary">
            View All Orders
          </Link>
        </div>
      </Container>
    </div>
  );
};

export default OrderConfirmation;
