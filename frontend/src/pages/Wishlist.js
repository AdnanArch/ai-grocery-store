import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Alert,
  Spinner,
  Modal,
  Form,
} from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { Link } from "react-router-dom";
import api from "../utils/axios";
import { toast } from "react-toastify";

const Wishlist = () => {
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWishlistName, setNewWishlistName] = useState("");
  const [selectedWishlist, setSelectedWishlist] = useState(null);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/wishlist");
      setWishlistItems(response.data);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await api.delete(`/api/wishlist/${productId}`);
      toast.success("Product removed from wishlist");
      fetchWishlist();
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove product from wishlist");
    }
  };

  const moveToCart = async (product) => {
    try {
      addToCart(product, 1);
      await removeFromWishlist(product.id);
      toast.success("Product moved to cart");
    } catch (error) {
      console.error("Error moving to cart:", error);
      toast.error("Failed to move product to cart");
    }
  };

  const createWishlist = async () => {
    if (!newWishlistName.trim()) {
      toast.error("Please enter a wishlist name");
      return;
    }

    try {
      await api.post("/api/wishlist/create", { name: newWishlistName });
      toast.success("Wishlist created successfully");
      setShowCreateModal(false);
      setNewWishlistName("");
      fetchWishlist();
    } catch (error) {
      console.error("Error creating wishlist:", error);
      toast.error("Failed to create wishlist");
    }
  };

  const addToWishlist = async (productId, wishlistId) => {
    try {
      await api.post(`/api/wishlist/${wishlistId}/add`, { productId });
      toast.success("Product added to wishlist");
      setSelectedWishlist(null);
      fetchWishlist();
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast.error("Failed to add product to wishlist");
    }
  };

  if (!user) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Alert variant="info">
          Please <Link to="/login">login</Link> to view your wishlist.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <div
      className="wishlist-page d-flex flex-column min-vh-100"
      style={{
        background: "#f8fbfa",
        fontFamily: "'Plus Jakarta Sans', 'Noto Sans', sans-serif",
      }}
    >
      <Container className="flex-grow-1 py-5">
        <Row>
          <Col>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1
                className="fw-bold"
                style={{ color: "#0e1a13", fontSize: "2.5rem" }}
              >
                My Wishlist
              </h1>
              <Button
                variant="success"
                onClick={() => setShowCreateModal(true)}
                className="homepage-btn-main"
                style={{ fontSize: "1rem" }}
              >
                Create New Wishlist
              </Button>
            </div>

            {wishlistItems.length === 0 ? (
              <Card className="border-0 shadow-sm text-center py-5">
                <Card.Body>
                  <div className="mb-4">
                    <i
                      className="fas fa-heart"
                      style={{ fontSize: "4rem", color: "#e5e7eb" }}
                    ></i>
                  </div>
                  <h4 style={{ color: "#64748b" }}>Your wishlist is empty</h4>
                  <p className="text-muted mb-4">
                    Start adding products to your wishlist to save them for
                    later.
                  </p>
                  <Link to="/shop">
                    <Button
                      variant="primary"
                      style={{ background: "#6366f1", border: "none" }}
                    >
                      Browse Products
                    </Button>
                  </Link>
                </Card.Body>
              </Card>
            ) : (
              <Row>
                {wishlistItems.map((item) => (
                  <Col key={item.id} lg={4} md={6} className="mb-4">
                    <Card className="border-0 shadow-sm h-100 product-card">
                      <div className="product-img-container">
                        <Card.Img
                          variant="top"
                          src={
                            item.product?.images?.[0]?.imageUrl ||
                            "/placeholder-product.jpg"
                          }
                          alt={item.product?.name}
                          className="product-img"
                          style={{ height: "200px", objectFit: "cover" }}
                        />
                        <div className="product-overlay">
                          <Button
                            variant="outline-light"
                            size="sm"
                            onClick={() => moveToCart(item.product)}
                            className="me-2"
                          >
                            <i className="fas fa-shopping-cart"></i> Add to Cart
                          </Button>
                          <Button
                            variant="outline-light"
                            size="sm"
                            onClick={() => removeFromWishlist(item.product.id)}
                          >
                            <i className="fas fa-trash"></i> Remove
                          </Button>
                        </div>
                      </div>
                      <Card.Body className="d-flex flex-column">
                        <div className="mb-2">
                          <Badge bg="secondary" className="mb-2">
                            {item.product?.category?.name}
                          </Badge>
                        </div>
                        <Card.Title className="h6 mb-2">
                          {item.product?.name}
                        </Card.Title>
                        <Card.Text className="text-muted small mb-3 flex-grow-1">
                          {item.product?.description?.substring(0, 100)}
                          {item.product?.description?.length > 100 && "..."}
                        </Card.Text>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="fw-bold text-primary">
                            ${item.product?.price}
                          </span>
                          <Link
                            to={`/product/${item.product?.id}`}
                            className="btn btn-outline-primary btn-sm"
                          >
                            View Details
                          </Link>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Col>
        </Row>
      </Container>

      {/* Create Wishlist Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Wishlist</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Wishlist Name</Form.Label>
              <Form.Control
                type="text"
                value={newWishlistName}
                onChange={(e) => setNewWishlistName(e.target.value)}
                placeholder="Enter wishlist name"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={createWishlist}
            style={{ background: "#6366f1", border: "none" }}
          >
            Create
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add to Wishlist Modal */}
      <Modal show={!!selectedWishlist} onHide={() => setSelectedWishlist(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Add to Wishlist</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Select a wishlist to add this product to:</p>
          {wishlistItems.map((wishlist) => (
            <Button
              key={wishlist.id}
              variant="outline-primary"
              className="w-100 mb-2"
              onClick={() => addToWishlist(selectedWishlist?.id, wishlist.id)}
            >
              {wishlist.name}
            </Button>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSelectedWishlist(null)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Wishlist;
