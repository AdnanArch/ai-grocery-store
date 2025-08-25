import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Spinner,
  Tabs,
  Tab,
  ProgressBar,
} from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { Link } from "react-router-dom";
import api from "../utils/axios";
import { toast } from "react-toastify";

const AIRecommendations = () => {
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const [recommendations, setRecommendations] = useState({
    personalized: [],
    trending: [],
    similar: [],
    seasonal: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("personalized");
  const [userPreferences, setUserPreferences] = useState({
    categories: [],
    priceRange: "all",
    dietaryRestrictions: [],
  });
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchRecommendations();
      fetchUserPreferences();
    }
  }, [user]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/ai/recommendations");
      setRecommendations(response.data);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      toast.error("Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPreferences = async () => {
    try {
      const response = await api.get("/api/ai/preferences");
      setUserPreferences(response.data);
    } catch (error) {
      console.error("Error fetching preferences:", error);
    }
  };

  const updatePreferences = async (preferences) => {
    try {
      await api.put("/api/ai/preferences", preferences);
      setUserPreferences(preferences);
      setShowPreferencesModal(false);
      fetchRecommendations(); // Refresh recommendations
      toast.success("Preferences updated successfully");
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast.error("Failed to update preferences");
    }
  };

  const addToCartFromRecommendation = (product) => {
    addToCart(product, 1);
    toast.success(`${product.name} added to cart`);
  };

  const getRecommendationReason = (product, type) => {
    const reasons = {
      personalized: "Based on your purchase history",
      trending: "Popular among other customers",
      similar: "Similar to products you've viewed",
      seasonal: "Perfect for this season",
    };
    return reasons[type] || "Recommended for you";
  };

  const getConfidenceScore = (product) => {
    return Math.floor(Math.random() * 30) + 70; // Mock confidence score
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
      className="ai-recommendations-page d-flex flex-column min-vh-100"
      style={{
        background: "#f8fbfa",
        fontFamily: "'Plus Jakarta Sans', 'Noto Sans', sans-serif",
      }}
    >
      <Container className="flex-grow-1 py-5">
        <Row>
          <Col>
            {/* Header */}
            <div className="text-center mb-5">
              <h1
                className="fw-bold"
                style={{ color: "#0e1a13", fontSize: "2.5rem" }}
              >
                AI-Powered Recommendations
              </h1>
              <p className="text-muted">
                Discover products tailored just for you using advanced machine
                learning
              </p>
              <Button
                variant="outline-success"
                onClick={() => setShowPreferencesModal(true)}
                className="mt-2"
                style={{
                  borderRadius: "12px",
                  borderWidth: "2px",
                  padding: "8px 16px",
                  fontWeight: "600",
                }}
              >
                <i className="fas fa-cog me-2"></i>
                Update Preferences
              </Button>
            </div>

            {/* AI Stats */}
            <Row className="mb-4">
              <Col md={3}>
                <Card className="border-0 shadow-sm text-center">
                  <Card.Body>
                    <div className="mb-2">
                      <i
                        className="fas fa-brain text-primary"
                        style={{ fontSize: "2rem" }}
                      ></i>
                    </div>
                    <h5>{recommendations.personalized.length}</h5>
                    <p className="text-muted mb-0">Personalized Items</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="border-0 shadow-sm text-center">
                  <Card.Body>
                    <div className="mb-2">
                      <i
                        className="fas fa-chart-line text-success"
                        style={{ fontSize: "2rem" }}
                      ></i>
                    </div>
                    <h5>{recommendations.trending.length}</h5>
                    <p className="text-muted mb-0">Trending Products</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="border-0 shadow-sm text-center">
                  <Card.Body>
                    <div className="mb-2">
                      <i
                        className="fas fa-magic text-warning"
                        style={{ fontSize: "2rem" }}
                      ></i>
                    </div>
                    <h5>95%</h5>
                    <p className="text-muted mb-0">Accuracy Rate</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="border-0 shadow-sm text-center">
                  <Card.Body>
                    <div className="mb-2">
                      <i
                        className="fas fa-clock text-info"
                        style={{ fontSize: "2rem" }}
                      ></i>
                    </div>
                    <h5>&lt;1s</h5>
                    <p className="text-muted mb-0">Response Time</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Recommendation Tabs */}
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              className="mb-4"
            >
              <Tab eventKey="personalized" title="Personalized">
                <RecommendationSection
                  products={recommendations.personalized}
                  type="personalized"
                  onAddToCart={addToCartFromRecommendation}
                  getReason={getRecommendationReason}
                  getConfidence={getConfidenceScore}
                />
              </Tab>
              <Tab eventKey="trending" title="Trending">
                <RecommendationSection
                  products={recommendations.trending}
                  type="trending"
                  onAddToCart={addToCartFromRecommendation}
                  getReason={getRecommendationReason}
                  getConfidence={getConfidenceScore}
                />
              </Tab>
              <Tab eventKey="similar" title="Similar Products">
                <RecommendationSection
                  products={recommendations.similar}
                  type="similar"
                  onAddToCart={addToCartFromRecommendation}
                  getReason={getRecommendationReason}
                  getConfidence={getConfidenceScore}
                />
              </Tab>
              <Tab eventKey="seasonal" title="Seasonal">
                <RecommendationSection
                  products={recommendations.seasonal}
                  type="seasonal"
                  onAddToCart={addToCartFromRecommendation}
                  getReason={getRecommendationReason}
                  getConfidence={getConfidenceScore}
                />
              </Tab>
            </Tabs>
          </Col>
        </Row>
      </Container>

      {/* Preferences Modal */}
      <PreferencesModal
        show={showPreferencesModal}
        onHide={() => setShowPreferencesModal(false)}
        preferences={userPreferences}
        onUpdate={updatePreferences}
      />
    </div>
  );
};

const RecommendationSection = ({
  products,
  type,
  onAddToCart,
  getReason,
  getConfidence,
}) => {
  if (products.length === 0) {
    return (
      <Card className="border-0 shadow-sm text-center py-5">
        <Card.Body>
          <div className="mb-4">
            <i
              className="fas fa-search"
              style={{ fontSize: "4rem", color: "#e5e7eb" }}
            ></i>
          </div>
          <h4 style={{ color: "#64748b" }}>No recommendations available</h4>
          <p className="text-muted">
            We're working on finding the perfect products for you.
          </p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Row>
      {products.map((product) => (
        <Col key={product.id} lg={4} md={6} className="mb-4">
          <Card className="border-0 shadow-sm h-100 product-card">
            <div className="product-img-container">
              <Card.Img
                variant="top"
                src={
                  product.images?.[0]?.imageUrl || "/placeholder-product.jpg"
                }
                alt={product.name}
                className="product-img"
                style={{ height: "200px", objectFit: "cover" }}
              />
              <div className="product-overlay">
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={() => onAddToCart(product)}
                  className="me-2"
                >
                  <i className="fas fa-shopping-cart"></i> Add to Cart
                </Button>
                <Link
                  to={`/product/${product.id}`}
                  className="btn btn-outline-light btn-sm"
                >
                  <i className="fas fa-eye"></i> View
                </Link>
              </div>
            </div>
            <Card.Body className="d-flex flex-column">
              <div className="mb-2">
                <Badge bg="secondary" className="mb-2">
                  {product.category?.name}
                </Badge>
                <Badge bg="info" className="ms-1">
                  AI Recommended
                </Badge>
              </div>

              <Card.Title className="h6 mb-2">{product.name}</Card.Title>

              <Card.Text className="text-muted small mb-3 flex-grow-1">
                {product.description?.substring(0, 100)}
                {product.description?.length > 100 && "..."}
              </Card.Text>

              {/* AI Confidence Score */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <small className="text-muted">AI Confidence</small>
                  <small className="text-muted">
                    {getConfidence(product)}%
                  </small>
                </div>
                <ProgressBar
                  now={getConfidence(product)}
                  variant="primary"
                  style={{ height: "4px" }}
                />
              </div>

              {/* Recommendation Reason */}
              <div className="mb-3">
                <small className="text-muted">
                  <i className="fas fa-lightbulb me-1"></i>
                  {getReason(product, type)}
                </small>
              </div>

              <div className="d-flex justify-content-between align-items-center mt-auto">
                <span className="fw-bold text-primary">${product.price}</span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onAddToCart(product)}
                  style={{ background: "#6366f1", border: "none" }}
                >
                  Add to Cart
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

const PreferencesModal = ({ show, onHide, preferences, onUpdate }) => {
  const [formData, setFormData] = useState(preferences);

  useEffect(() => {
    setFormData(preferences);
  }, [preferences]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  const categories = [
    "Fruits & Vegetables",
    "Dairy & Eggs",
    "Meat & Fish",
    "Bakery",
    "Beverages",
    "Snacks",
    "Organic",
    "Gluten-Free",
    "Vegan",
  ];

  const dietaryRestrictions = [
    "Vegetarian",
    "Vegan",
    "Gluten-Free",
    "Dairy-Free",
    "Nut-Free",
    "Halal",
    "Kosher",
  ];

  return (
    <div
      className={`modal fade ${show ? "show" : ""}`}
      style={{ display: show ? "block" : "none" }}
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">AI Preferences</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onHide}
            ></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-6">
                  <h6>Favorite Categories</h6>
                  {categories.map((category) => (
                    <div key={category} className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={category}
                        checked={formData.categories.includes(category)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              categories: [...formData.categories, category],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              categories: formData.categories.filter(
                                (c) => c !== category
                              ),
                            });
                          }
                        }}
                      />
                      <label className="form-check-label" htmlFor={category}>
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
                <div className="col-md-6">
                  <h6>Dietary Restrictions</h6>
                  {dietaryRestrictions.map((restriction) => (
                    <div key={restriction} className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={restriction}
                        checked={formData.dietaryRestrictions.includes(
                          restriction
                        )}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              dietaryRestrictions: [
                                ...formData.dietaryRestrictions,
                                restriction,
                              ],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              dietaryRestrictions:
                                formData.dietaryRestrictions.filter(
                                  (r) => r !== restriction
                                ),
                            });
                          }
                        }}
                      />
                      <label className="form-check-label" htmlFor={restriction}>
                        {restriction}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="row mt-3">
                <div className="col-md-6">
                  <h6>Price Range</h6>
                  <select
                    className="form-select"
                    value={formData.priceRange}
                    onChange={(e) =>
                      setFormData({ ...formData, priceRange: e.target.value })
                    }
                  >
                    <option value="all">All Prices</option>
                    <option value="low">Under $10</option>
                    <option value="medium">$10 - $25</option>
                    <option value="high">Over $25</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onHide}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ background: "#6366f1", border: "none" }}
              >
                Update Preferences
              </button>
            </div>
          </form>
        </div>
      </div>
      {show && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};

export default AIRecommendations;
