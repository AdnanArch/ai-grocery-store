import React, { useState, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Spinner,
  Modal,
  Form,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingCart,
  faHeart,
  faStar,
  faTrash,
  faFire,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const Wishlist = () => {
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const { wishlistItems, loading, removeFromWishlist, createWishlist } =
    useContext(WishlistContext);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWishlistName, setNewWishlistName] = useState("");

  const moveToCart = async (product) => {
    try {
      addToCart(product, 1);
      await removeFromWishlist(product.id);
      toast.success("Product moved to cart", { autoClose: 4000 });
    } catch (error) {
      console.error("Error moving to cart:", error);
      toast.error("Failed to move product to cart", { autoClose: 8000 });
    }
  };

  const handleCreateWishlist = async () => {
    if (!newWishlistName.trim()) {
      toast.error("Please enter a wishlist name", { autoClose: 8000 });
      return;
    }

    const success = await createWishlist(newWishlistName);
    if (success) {
      setShowCreateModal(false);
      setNewWishlistName("");
    }
  };

  if (!user) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100"></Container>
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
                    <FontAwesomeIcon
                      icon={faHeart}
                      style={{ fontSize: "4rem", color: "#e5e7eb" }}
                    />
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
              <div className="products-grid">
                {wishlistItems.map((item) => (
                  <Card
                    key={item.id}
                    className="product-card product-card-grid"
                  >
                    <div className="product-image-container">
                      <img
                        src={
                          item.product?.images?.[0]?.url ||
                          "/placeholder-product.jpg"
                        }
                        alt={item.product?.name}
                        className="product-image"
                        onError={(e) => {
                          e.target.src = "/placeholder-product.jpg";
                        }}
                        loading="lazy"
                      />

                      {/* Product Badges */}
                      <div className="product-badges">
                        {item.product?.stock <= 10 &&
                          item.product?.stock > 0 && (
                            <Badge bg="warning" className="stock-badge">
                              <FontAwesomeIcon icon={faFire} className="me-1" />
                              Low Stock
                            </Badge>
                          )}
                        {item.product?.stock === 0 && (
                          <Badge bg="danger" className="stock-badge">
                            Out of Stock
                          </Badge>
                        )}
                        {item.product?.stock > 50 && (
                          <Badge bg="success" className="stock-badge">
                            <FontAwesomeIcon
                              icon={faCheckCircle}
                              className="me-1"
                            />
                            In Stock
                          </Badge>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <div className="product-actions">
                        <Button
                          variant="light"
                          size="sm"
                          className="action-btn remove-btn"
                          onClick={async () => {
                            try {
                              const success = await removeFromWishlist(
                                item.product.id
                              );
                              if (!success) {
                                console.error(
                                  "Failed to remove product from wishlist"
                                );
                              }
                            } catch (error) {
                              console.error(
                                "Error in remove button click:",
                                error
                              );
                              toast.error(
                                "An error occurred while removing the product",
                                { autoClose: 8000 }
                              );
                            }
                          }}
                          title="Remove from Wishlist"
                        >
                          <FontAwesomeIcon
                            icon={faTrash}
                            className="text-danger"
                          />
                        </Button>
                      </div>
                    </div>

                    <Card.Body>
                      <div className="product-info">
                        <div className="product-category">
                          {item.product?.category?.name || "Uncategorized"}
                        </div>
                        <h6 className="product-title">{item.product?.name}</h6>
                        <p className="product-description">
                          {item.product?.description?.substring(0, 80)}...
                        </p>

                        <div className="product-rating">
                          <div className="rating-stars">
                            <FontAwesomeIcon icon={faStar} />
                            <FontAwesomeIcon icon={faStar} />
                            <FontAwesomeIcon icon={faStar} />
                            <FontAwesomeIcon icon={faStar} />
                            <FontAwesomeIcon icon={faStar} />
                          </div>
                          <span className="rating-text">4.5 (120)</span>
                        </div>

                        <div className="product-price">
                          <span className="current-price">
                            ₨{item.product?.price?.toLocaleString()}
                          </span>
                          {item.product?.originalPrice &&
                            item.product?.originalPrice >
                              item.product?.price && (
                              <>
                                <span className="original-price">
                                  ₨
                                  {item.product?.originalPrice?.toLocaleString()}
                                </span>
                                <span className="discount-badge">
                                  {Math.round(
                                    ((item.product?.originalPrice -
                                      item.product?.price) /
                                      item.product?.originalPrice) *
                                      100
                                  )}
                                  % OFF
                                </span>
                              </>
                            )}
                        </div>
                      </div>

                      <div className="product-actions-bottom">
                        <Button
                          variant="primary"
                          className="add-to-cart-btn w-100"
                          onClick={() => moveToCart(item.product)}
                          disabled={item.product?.stock <= 0}
                        >
                          <FontAwesomeIcon
                            icon={faShoppingCart}
                            className="me-2"
                          />
                          {item.product?.stock <= 0
                            ? "Out of Stock"
                            : "Add to Cart"}
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
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
            onClick={handleCreateWishlist}
            style={{ background: "#6366f1", border: "none" }}
          >
            Create
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Wishlist;
