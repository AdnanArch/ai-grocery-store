import React, { useState, useEffect, useContext } from "react";
import { Card, Row, Col, Button, Badge, Alert, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRobot,
  faShoppingCart,
  faHeart,
  faEye,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { CartContext } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";
import api from "../../utils/axios";

const RecommendationWidget = ({
  title = "AI Recommendations",
  type = "personalized", // Options: personalized, trending, similar, complementary
  productId = null,
  limit = 4,
  showAddToCart = true,
}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useContext(CartContext);
  const { isAuthenticated, user } = useContext(AuthContext);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);

        let endpoint = "/api/recommendations";
        let params = { limit };

        // Determine which endpoint to use based on recommendation type
        switch (type) {
          case "personalized":
            if (isAuthenticated && user) {
              endpoint = "/api/recommendations/personalized";
            } else {
              endpoint = "/api/recommendations/trending"; // Fallback for non-authenticated users
            }
            break;
          case "trending":
            endpoint = "/api/recommendations/trending";
            break;
          case "similar":
            if (!productId) {
              throw new Error(
                "Product ID is required for similar recommendations"
              );
            }
            endpoint = `/api/recommendations/similar/${productId}`;
            break;
          case "complementary":
            if (!productId) {
              throw new Error(
                "Product ID is required for complementary recommendations"
              );
            }
            endpoint = `/api/recommendations/complementary/${productId}`;
            break;
          default:
            endpoint = "/api/recommendations/trending";
        }

        const response = await api.get(endpoint, { params });
        setRecommendations(response.data);
      } catch (err) {
        console.error("Error fetching recommendations:", err);
        setError("Unable to load recommendations at this time");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [type, productId, limit, isAuthenticated, user]);

  const handleAddToCart = (product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.imageUrl || "/images/placeholder.jpg",
      quantity: 1,
    });
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">Loading recommendations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="warning">
        <FontAwesomeIcon icon={faRobot} className="me-2" />
        {error}
      </Alert>
    );
  }

  if (recommendations.length === 0) {
    return null; // Don't show the widget if there are no recommendations
  }

  return (
    <Card className="border-0 shadow-sm mb-4">
      <Card.Header className="bg-white border-0 pt-4 pb-0">
        <div className="d-flex justify-content-between align-items-center">
          <h3 className="h5 mb-0">
            <FontAwesomeIcon icon={faRobot} className="text-primary me-2" />
            {title}
          </h3>
          {type === "personalized" && isAuthenticated && (
            <Badge bg="info" pill>
              Personalized for you
            </Badge>
          )}
        </div>
      </Card.Header>
      <Card.Body>
        <Row xs={1} sm={2} md={4} className="g-3">
          {recommendations.map((product) => (
            <Col key={product.id}>
              <Card className="h-100 product-card">
                <Link
                  to={`/products/${product.id}`}
                  className="text-decoration-none"
                >
                  <div className="product-image-container">
                    <Card.Img
                      variant="top"
                      src={product.imageUrl || "/images/placeholder.jpg"}
                      alt={product.name}
                      className="product-image"
                    />
                  </div>
                </Link>
                <Card.Body className="d-flex flex-column">
                  <Link
                    to={`/products/${product.id}`}
                    className="text-decoration-none"
                  >
                    <Card.Title className="h6 text-truncate">
                      {product.name}
                    </Card.Title>
                  </Link>
                  <div className="d-flex justify-content-between align-items-center mt-auto">
                    <span className="fw-bold text-primary">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.rating && (
                      <span className="text-warning">
                        <FontAwesomeIcon icon={faStar} /> {product.rating}
                      </span>
                    )}
                  </div>
                  {showAddToCart && (
                    <button
                      className="btn btn-sm btn-outline-primary w-100 mt-2"
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart(product);
                      }}
                    >
                      <FontAwesomeIcon icon={faShoppingCart} className="me-1" />
                      Add to Cart
                    </button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Card.Body>
    </Card>
  );
};

export default RecommendationWidget;
