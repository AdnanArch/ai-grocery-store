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
  Pagination,
} from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";
import { useParams, Link } from "react-router-dom";
import api from "../utils/axios";
import { toast } from "react-toastify";

const ProductReviews = () => {
  const { user } = useContext(AuthContext);
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: "",
    comment: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterRating, setFilterRating] = useState(0);
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    if (productId) {
      fetchProduct();
      fetchReviews();
    }
  }, [productId, currentPage, filterRating, sortBy]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/api/products/${productId}`);
      setProduct(response.data);
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Failed to load product details");
    }
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage - 1,
        size: 10,
        sort: sortBy,
      };
      if (filterRating > 0) {
        params.rating = filterRating;
      }

      const response = await api.get(`/api/products/${productId}/reviews`, {
        params,
      });
      setReviews(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (!newReview.title.trim() || !newReview.comment.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await api.post(`/api/products/${productId}/reviews`, newReview);
      toast.success("Review submitted successfully");
      setShowReviewModal(false);
      setNewReview({ rating: 5, title: "", comment: "" });
      fetchReviews();
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    }
  };

  const deleteReview = async (reviewId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await api.delete(`/api/reviews/${reviewId}`);
        toast.success("Review deleted successfully");
        fetchReviews();
      } catch (error) {
        console.error("Error deleting review:", error);
        toast.error("Failed to delete review");
      }
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <i
        key={i}
        className={`fas fa-star ${i < rating ? "text-warning" : "text-muted"}`}
      ></i>
    ));
  };

  const getRatingText = (rating) => {
    const ratings = {
      1: "Poor",
      2: "Fair",
      3: "Good",
      4: "Very Good",
      5: "Excellent",
    };
    return ratings[rating] || "Good";
  };

  if (loading && !product) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Alert variant="danger">Product not found</Alert>
      </Container>
    );
  }

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  return (
    <div
      className="product-reviews-page d-flex flex-column min-vh-100"
      style={{
        background: "#f8fbfa",
        fontFamily: "'Plus Jakarta Sans', 'Noto Sans', sans-serif",
      }}
    >
      <Container className="flex-grow-1 py-5">
        <Row>
          <Col>
            {/* Product Header */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body>
                <Row>
                  <Col md={3}>
                    <img
                      src={
                        product.images?.[0]?.imageUrl ||
                        "/placeholder-product.jpg"
                      }
                      alt={product.name}
                      className="img-fluid rounded"
                      style={{ maxHeight: "200px", objectFit: "cover" }}
                    />
                  </Col>
                  <Col md={9}>
                    <h2
                      className="fw-bold"
                      style={{ color: "#0e1a13", fontSize: "2rem" }}
                    >
                      {product.name}
                    </h2>
                    <p className="text-muted mb-3">{product.description}</p>
                    <div className="d-flex align-items-center mb-3">
                      <div className="me-3">
                        {renderStars(Math.round(averageRating))}
                        <span className="ms-2 text-muted">
                          ({reviews.length} reviews)
                        </span>
                      </div>
                      <Badge bg="primary" className="me-2">
                        {averageRating.toFixed(1)}/5
                      </Badge>
                    </div>
                    <Link to={`/product/${product.id}`}>
                      <Button variant="outline-primary" size="sm">
                        View Product Details
                      </Button>
                    </Link>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Reviews Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3
                className="fw-bold"
                style={{ color: "#0e1a13", fontSize: "1.5rem" }}
              >
                Customer Reviews
              </h3>
              {user && (
                <Button
                  variant="success"
                  onClick={() => setShowReviewModal(true)}
                  className="homepage-btn-main"
                  style={{ fontSize: "1rem" }}
                >
                  Write a Review
                </Button>
              )}
            </div>

            {/* Filters */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body>
                <Row>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Filter by Rating</Form.Label>
                      <Form.Select
                        value={filterRating}
                        onChange={(e) =>
                          setFilterRating(Number(e.target.value))
                        }
                      >
                        <option value={0}>All Ratings</option>
                        <option value={5}>5 Stars</option>
                        <option value={4}>4+ Stars</option>
                        <option value={3}>3+ Stars</option>
                        <option value={2}>2+ Stars</option>
                        <option value={1}>1+ Stars</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Sort By</Form.Label>
                      <Form.Select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="rating-high">Highest Rating</option>
                        <option value="rating-low">Lowest Rating</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4} className="d-flex align-items-end">
                    <div className="text-muted">
                      Showing {reviews.length} of {totalPages * 10} reviews
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Reviews List */}
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            ) : reviews.length === 0 ? (
              <Card className="border-0 shadow-sm text-center py-5">
                <Card.Body>
                  <div className="mb-4">
                    <i
                      className="fas fa-comments"
                      style={{ fontSize: "4rem", color: "#e5e7eb" }}
                    ></i>
                  </div>
                  <h4 style={{ color: "#64748b" }}>No reviews yet</h4>
                  <p className="text-muted mb-4">
                    Be the first to review this product!
                  </p>
                  {user && (
                    <Button
                      variant="primary"
                      onClick={() => setShowReviewModal(true)}
                      style={{ background: "#6366f1", border: "none" }}
                    >
                      Write First Review
                    </Button>
                  )}
                </Card.Body>
              </Card>
            ) : (
              <>
                {reviews.map((review) => (
                  <Card key={review.id} className="border-0 shadow-sm mb-3">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <h6 className="mb-1">{review.title}</h6>
                          <div className="mb-2">
                            {renderStars(review.rating)}
                            <span className="ms-2 text-muted">
                              {getRatingText(review.rating)}
                            </span>
                          </div>
                        </div>
                        <div className="text-muted small">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <p className="mb-3">{review.comment}</p>
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="text-muted small">
                          By {review.user?.firstName} {review.user?.lastName}
                        </div>
                        {user &&
                          (user.id === review.user?.id ||
                            user.roles?.some(
                              (role) => role.name === "ROLE_ADMIN"
                            )) && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => deleteReview(review.id)}
                            >
                              Delete
                            </Button>
                          )}
                      </div>
                    </Card.Body>
                  </Card>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-center mt-4">
                    <Pagination>
                      <Pagination.First
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                      />
                      <Pagination.Prev
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      />

                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          const pageNum =
                            Math.max(
                              1,
                              Math.min(totalPages - 4, currentPage - 2)
                            ) + i;
                          return (
                            <Pagination.Item
                              key={pageNum}
                              active={pageNum === currentPage}
                              onClick={() => setCurrentPage(pageNum)}
                            >
                              {pageNum}
                            </Pagination.Item>
                          );
                        }
                      )}

                      <Pagination.Next
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      />
                      <Pagination.Last
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                      />
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </Col>
        </Row>
      </Container>

      {/* Write Review Modal */}
      <Modal
        show={showReviewModal}
        onHide={() => setShowReviewModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Write a Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Rating</Form.Label>
              <div className="d-flex align-items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <i
                    key={star}
                    className={`fas fa-star me-1 ${
                      star <= newReview.rating ? "text-warning" : "text-muted"
                    }`}
                    style={{ cursor: "pointer", fontSize: "1.5rem" }}
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                  ></i>
                ))}
                <span className="ms-3 text-muted">
                  {getRatingText(newReview.rating)}
                </span>
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Review Title</Form.Label>
              <Form.Control
                type="text"
                value={newReview.title}
                onChange={(e) =>
                  setNewReview({ ...newReview, title: e.target.value })
                }
                placeholder="Summarize your experience"
                maxLength={100}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Review Comment</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={newReview.comment}
                onChange={(e) =>
                  setNewReview({ ...newReview, comment: e.target.value })
                }
                placeholder="Share your detailed experience with this product..."
                maxLength={1000}
              />
              <Form.Text className="text-muted">
                {newReview.comment.length}/1000 characters
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReviewModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={submitReview}
            style={{ background: "#6366f1", border: "none" }}
          >
            Submit Review
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProductReviews;
