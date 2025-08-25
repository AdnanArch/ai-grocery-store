import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Breadcrumb,
} from "react-bootstrap";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingCart,
  faArrowLeft,
  faCheck,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart as farHeart } from "@fortawesome/free-regular-svg-icons";
import axios from "axios";
import { CartContext } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";
import RecommendationWidget from "../components/ui/RecommendationWidget";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { addToWishlist } = useContext(WishlistContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`/api/products/${id}`);
        setProduct(response.data);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Handle quantity change
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= (product?.stock || 1)) {
      setQuantity(value);
    }
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  // Handle add to wishlist
  const handleAddToWishlist = () => {
    if (product) {
      addToWishlist(product);
    }
  };

  // Handle image selection
  const handleImageSelect = (index) => {
    setSelectedImage(index);
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container className="py-5">
        <Button variant="outline-primary" onClick={() => navigate("/shop")}>
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Back to Shop
        </Button>
      </Container>
    );
  }

  return (
    <div
      className="product-detail-page py-5"
      style={{
        background: "#f8fbfa",
        fontFamily: "'Plus Jakarta Sans', 'Noto Sans', sans-serif",
        minHeight: "100vh",
      }}
    >
      <Container>
        {/* Breadcrumb */}
        <Breadcrumb className="mb-4">
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
            Home
          </Breadcrumb.Item>
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/shop" }}>
            Shop
          </Breadcrumb.Item>
          {product.category && (
            <Breadcrumb.Item
              linkAs={Link}
              linkProps={{ to: `/shop?categoryId=${product.category.id}` }}
            >
              {product.category.name}
            </Breadcrumb.Item>
          )}
          <Breadcrumb.Item active>{product.name}</Breadcrumb.Item>
        </Breadcrumb>

        <Row>
          {/* Product Images */}
          <Col lg={6} className="mb-4 mb-lg-0">
            <Card className="border-0 shadow-sm">
              <div className="product-main-image p-3">
                <img
                  src={
                    product.images && product.images.length > 0
                      ? product.images[selectedImage]?.url
                      : `https://source.unsplash.com/600x400/?${product.name.toLowerCase()},grocery`
                  }
                  alt={product.name}
                  className="img-fluid product-detail-img"
                />
              </div>

              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="product-thumbnails d-flex p-3 pt-0">
                  {product.images.map((image, index) => (
                    <div
                      key={index}
                      className={`product-thumbnail me-2 ${
                        selectedImage === index ? "active" : ""
                      }`}
                      onClick={() => handleImageSelect(index)}
                    >
                      <img
                        src={image.url}
                        alt={`${product.name} - Image ${index + 1}`}
                        className="img-fluid"
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </Col>

          {/* Product Info */}
          <Col lg={6}>
            <h1 className="mb-2">{product.name}</h1>

            <div className="mb-3">
              <span className="badge bg-secondary me-2">
                {product.category?.name || "Uncategorized"}
              </span>
              <span className="h4 text-success">
                ₨{product.price.toLocaleString()}
              </span>
            </div>

            <p className="mb-4">{product.description}</p>

            <div className="mb-4">
              <div className="d-flex align-items-center mb-2">
                <span className="me-2">Availability:</span>
                {product.stock > 0 ? (
                  <span className="text-success">
                    <FontAwesomeIcon icon={faCheck} className="me-1" />
                    In Stock ({product.stock} available)
                  </span>
                ) : (
                  <span className="text-danger">Out of Stock</span>
                )}
              </div>
            </div>

            {product.stock > 0 ? (
              <div className="d-flex flex-column flex-sm-row align-items-sm-center mb-4">
                <Form.Group className="me-sm-3 mb-3 mb-sm-0 quantity-control">
                  <Form.Label>Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={handleQuantityChange}
                  />
                </Form.Group>

                <div className="d-flex flex-column flex-sm-row gap-2 flex-grow-1">
                  <Button
                    variant="primary"
                    size="lg"
                    className="flex-grow-1"
                    onClick={handleAddToCart}
                  >
                    <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                    Add to Cart
                  </Button>

                  <Button
                    variant="outline-secondary"
                    size="lg"
                    onClick={handleAddToWishlist}
                    title="Add to Wishlist"
                  >
                    <FontAwesomeIcon icon={farHeart} />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="d-flex flex-column flex-sm-row gap-2 mb-4">
                <Button variant="secondary" size="lg" disabled>
                  Out of Stock
                </Button>

                <Button
                  variant="outline-secondary"
                  size="lg"
                  onClick={handleAddToWishlist}
                  title="Add to Wishlist"
                >
                  <FontAwesomeIcon icon={farHeart} />
                </Button>
              </div>
            )}

            {/* Product Metadata */}
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h5>Product Details</h5>
                <Row>
                  <Col xs={4} className="text-muted">
                    SKU:
                  </Col>
                  <Col xs={8}>{product.id}</Col>
                </Row>
                <Row>
                  <Col xs={4} className="text-muted">
                    Stock:
                  </Col>
                  <Col xs={8}>{product.stock} units</Col>
                </Row>
                <Row>
                  <Col xs={4} className="text-muted">
                    Category:
                  </Col>
                  <Col xs={8}>{product.category?.name || "Uncategorized"}</Col>
                </Row>
                <Row>
                  <Col xs={4} className="text-muted">
                    Added:
                  </Col>
                  <Col xs={8}>
                    {product.createdAt
                      ? new Date(product.createdAt).toLocaleDateString()
                      : "N/A"}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* AI-Powered Recommendations */}
        <div className="recommendations-section mt-5">
          {/* Similar Products */}
          <RecommendationWidget
            title="Similar Products"
            type="similar"
            productId={id}
            limit={4}
          />

          {/* Complementary Products */}
          <div className="mt-5">
            <RecommendationWidget
              title="Frequently Bought Together"
              type="complementary"
              productId={id}
              limit={4}
            />
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ProductDetail;
