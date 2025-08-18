import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Button,
  Spinner,
  Alert,
  Accordion,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faFileInvoice,
  faShoppingBag,
  faBoxOpen,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const Orders = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get("/api/orders", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setOrders(response.data);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(
          err.response?.data?.message ||
            "Failed to load orders. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return <Badge bg="warning">Pending</Badge>;
      case "processing":
        return <Badge bg="info">Processing</Badge>;
      case "shipped":
        return <Badge bg="primary">Shipped</Badge>;
      case "delivered":
        return <Badge bg="success">Delivered</Badge>;
      case "cancelled":
        return <Badge bg="danger">Cancelled</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  if (!user) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Please log in to view your orders.</Alert>
      </Container>
    );
  }

  return (
    <div
      style={{
        background: "#f8fbfa",
        fontFamily: "'Plus Jakarta Sans', 'Noto Sans', sans-serif",
        minHeight: "100vh",
      }}
    >
      <Container className="py-5">
        <h1 
          className="mb-4 fw-bold"
          style={{ color: "#0e1a13", fontSize: "2.5rem" }}
        >
          My Orders
        </h1>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3">Loading your orders...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : orders.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <FontAwesomeIcon
              icon={faShoppingBag}
              size="3x"
              className="text-muted mb-3"
            />
            <h3>No Orders Found</h3>
            <p className="text-muted">You haven't placed any orders yet.</p>
            <Link to="/products" className="btn btn-primary mt-3">
              Start Shopping
            </Link>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          <Col lg={12}>
            <Card className="shadow-sm">
              <Card.Body>
                <Accordion>
                  {orders.map((order, index) => (
                    <Accordion.Item key={order.id} eventKey={index.toString()}>
                      <Accordion.Header>
                        <div className="d-flex justify-content-between align-items-center w-100 me-3">
                          <div>
                            <strong>Order #{order.id}</strong>
                            <span className="text-muted ms-3">
                              {formatDate(order.createdAt)}
                            </span>
                          </div>
                          <div className="d-flex align-items-center">
                            <span className="me-3">
                              ${order.totalAmount?.toFixed(2)}
                            </span>
                            {getStatusBadge(order.status)}
                          </div>
                        </div>
                      </Accordion.Header>
                      <Accordion.Body>
                        <Table responsive className="mb-4">
                          <thead>
                            <tr>
                              <th>Product</th>
                              <th>Price</th>
                              <th>Quantity</th>
                              <th>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.orderItems?.map((item) => (
                              <tr key={item.id}>
                                <td>
                                  <div className="d-flex align-items-center">
                                    {item.product?.images &&
                                    item.product.images.length > 0 ? (
                                      <img
                                        src={item.product.images[0].url}
                                        alt={item.product.name}
                                        width="50"
                                        height="50"
                                        className="me-3"
                                        style={{ objectFit: "cover" }}
                                      />
                                    ) : (
                                      <div
                                        className="bg-light me-3"
                                        style={{
                                          width: "50px",
                                          height: "50px",
                                        }}
                                      />
                                    )}
                                    <div>
                                      <Link
                                        to={`/products/${item.product?.id}`}
                                      >
                                        {item.product?.name}
                                      </Link>
                                    </div>
                                  </div>
                                </td>
                                <td>${item.price?.toFixed(2)}</td>
                                <td>{item.quantity}</td>
                                <td>
                                  ${(item.price * item.quantity).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>

                        <Row className="mb-3">
                          <Col md={6}>
                            <h5>Shipping Address</h5>
                            <p className="mb-0">
                              {order.shippingAddress?.street}
                              <br />
                              {order.shippingAddress?.city},{" "}
                              {order.shippingAddress?.state}{" "}
                              {order.shippingAddress?.zipCode}
                              <br />
                              {order.shippingAddress?.country}
                            </p>
                          </Col>
                          <Col md={6}>
                            <h5>Order Summary</h5>
                            <div className="d-flex justify-content-between">
                              <span>Subtotal:</span>
                              <span>${order.subtotal?.toFixed(2)}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                              <span>Shipping:</span>
                              <span>${order.shippingCost?.toFixed(2)}</span>
                            </div>
                            {order.discount > 0 && (
                              <div className="d-flex justify-content-between">
                                <span>Discount:</span>
                                <span>-${order.discount?.toFixed(2)}</span>
                              </div>
                            )}
                            <div className="d-flex justify-content-between mt-2">
                              <strong>Total:</strong>
                              <strong>${order.totalAmount?.toFixed(2)}</strong>
                            </div>
                          </Col>
                        </Row>

                        <div className="d-flex justify-content-end">
                          <Link
                            to={`/order-confirmation/${order.id}`}
                            className="btn btn-outline-primary me-2"
                          >
                            <FontAwesomeIcon icon={faEye} className="me-2" />
                            View Details
                          </Link>
                          <Button variant="outline-secondary">
                            <FontAwesomeIcon
                              icon={faFileInvoice}
                              className="me-2"
                            />
                            Download Invoice
                          </Button>
                        </div>
                      </Accordion.Body>
                    </Accordion.Item>
                  ))}
                </Accordion>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
    </div>
  );
};

export default Orders;
