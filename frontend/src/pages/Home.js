import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faStar,
  faShoppingCart,
  faHeart,
  faEye,
  faLeaf,
  faTruck,
  faShieldAlt,
  faClock,
  faUsers,
  faAward,
  faCheckCircle,
  faPlay,
  faQuoteLeft,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart as farHeart } from "@fortawesome/free-regular-svg-icons";

const Home = () => {
  const [featuredProducts] = useState([
    {
      id: 1,
      name: "Organic Fresh Vegetables Bundle",
      price: 1299,
      originalPrice: 1599,
      image:
        "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop",
      category: "Vegetables",
      rating: 4.8,
      discount: 20,
      stock: 45,
    },
    {
      id: 2,
      name: "Premium Dairy Products Pack",
      price: 850,
      originalPrice: 1000,
      image:
        "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop",
      category: "Dairy",
      rating: 4.9,
      discount: 15,
      stock: 32,
    },
    {
      id: 3,
      name: "Fresh Artisan Bakery Collection",
      price: 699,
      originalPrice: 899,
      image:
        "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop",
      category: "Bakery",
      rating: 4.7,
      discount: 25,
      stock: 28,
    },
    {
      id: 4,
      name: "Organic Fruits Premium Bundle",
      price: 1899,
      originalPrice: 2499,
      image:
        "https://images.unsplash.com/photo-1619566636858-adf3f41a0c0a?w=400&h=300&fit=crop",
      category: "Fruits",
      rating: 4.6,
      discount: 24,
      stock: 15,
    },
  ]);

  const [categories] = useState([
    {
      name: "Fresh Produce",
      icon: "🥬",
      count: 150,
      color: "#4ade80",
      image:
        "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&h=200&fit=crop",
    },
    {
      name: "Dairy & Eggs",
      icon: "🥛",
      count: 89,
      color: "#fbbf24",
      image:
        "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&h=200&fit=crop",
    },
    {
      name: "Meat & Seafood",
      icon: "🥩",
      count: 67,
      color: "#f87171",
      image:
        "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300&h=200&fit=crop",
    },
    {
      name: "Pantry Essentials",
      icon: "🍯",
      count: 234,
      color: "#a78bfa",
      image:
        "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=200&fit=crop",
    },
    {
      name: "Beverages",
      icon: "🥤",
      count: 112,
      color: "#60a5fa",
      image:
        "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&h=200&fit=crop",
    },
    {
      name: "Frozen Foods",
      icon: "🧊",
      count: 78,
      color: "#34d399",
      image:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop",
    },
  ]);

  const [testimonials] = useState([
    {
      id: 1,
      name: "Sarah Ahmed",
      role: "Home Chef",
      content:
        "The quality of fresh produce is outstanding! I love how everything is delivered right to my doorstep.",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
    },
    {
      id: 2,
      name: "Ahmed Hassan",
      role: "Restaurant Owner",
      content:
        "Best grocery delivery service I've used. Fast, reliable, and the products are always fresh.",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    },
    {
      id: 3,
      name: "Fatima Khan",
      role: "Health Enthusiast",
      content:
        "Perfect for my healthy lifestyle. The organic selection is amazing and prices are reasonable.",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    },
  ]);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-pattern"></div>
        </div>
        <Container>
          <Row className="align-items-center min-vh-100">
            <Col lg={6} className="hero-content">
              <Badge bg="success" className="hero-badge mb-3">
                <FontAwesomeIcon icon={faLeaf} className="me-2" />
                Fresh & Organic
              </Badge>
              <h1 className="hero-title">
                Fresh Groceries Delivered to Your
                <span className="text-primary"> Doorstep</span>
              </h1>
              <p className="hero-subtitle">
                Discover the finest selection of fresh, organic groceries. Fast
                delivery, competitive prices, and exceptional quality
                guaranteed.
              </p>
              <div className="hero-actions">
                <Button
                  variant="primary"
                  size="lg"
                  className="me-3"
                  as={Link}
                  to="/shop"
                >
                  Shop Now
                  <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
                </Button>
                <Button
                  variant="outline-primary"
                  size="lg"
                  as={Link}
                  to="/about"
                >
                  Learn More
                </Button>
              </div>
              <div className="hero-stats">
                <div className="stat-item">
                  <div className="stat-number">10K+</div>
                  <div className="stat-label">Happy Customers</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">500+</div>
                  <div className="stat-label">Products</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">24/7</div>
                  <div className="stat-label">Support</div>
                </div>
              </div>
            </Col>
            <Col lg={6} className="hero-image">
              <div className="hero-image-container">
                <img
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=400&fit=crop"
                  alt="Fresh Groceries"
                  className="hero-main-image"
                />
                <div className="floating-card card-1">
                  <FontAwesomeIcon icon={faTruck} className="text-primary" />
                  <span>Fast Delivery</span>
                </div>
                <div className="floating-card card-2">
                  <FontAwesomeIcon
                    icon={faShieldAlt}
                    className="text-success"
                  />
                  <span>100% Fresh</span>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="features-section py-5">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="section-title">Why Choose Us</h2>
              <p className="section-subtitle">
                We're committed to providing the best grocery shopping
                experience
              </p>
            </Col>
          </Row>
          <Row>
            <Col lg={3} md={6} className="mb-4">
              <div className="feature-card">
                <div className="feature-icon">
                  <FontAwesomeIcon icon={faTruck} />
                </div>
                <h4>Fast Delivery</h4>
                <p>Same-day delivery for orders placed before 2 PM</p>
              </div>
            </Col>
            <Col lg={3} md={6} className="mb-4">
              <div className="feature-card">
                <div className="feature-icon">
                  <FontAwesomeIcon icon={faLeaf} />
                </div>
                <h4>Fresh Products</h4>
                <p>Handpicked fresh products from local farmers</p>
              </div>
            </Col>
            <Col lg={3} md={6} className="mb-4">
              <div className="feature-card">
                <div className="feature-icon">
                  <FontAwesomeIcon icon={faShieldAlt} />
                </div>
                <h4>Quality Guarantee</h4>
                <p>100% satisfaction guarantee on all products</p>
              </div>
            </Col>
            <Col lg={3} md={6} className="mb-4">
              <div className="feature-card">
                <div className="feature-icon">
                  <FontAwesomeIcon icon={faClock} />
                </div>
                <h4>24/7 Support</h4>
                <p>Round-the-clock customer support available</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Categories Section */}
      <section className="categories-section py-5 bg-light">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="section-title">Shop by Category</h2>
              <p className="section-subtitle">
                Explore our wide range of fresh products
              </p>
            </Col>
          </Row>
          <Row>
            {categories.map((category, index) => (
              <Col lg={4} md={6} className="mb-4" key={index}>
                <Card className="category-card h-100">
                  <div className="category-image-container">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="category-image"
                    />
                    <div className="category-overlay">
                      <div className="category-icon">{category.icon}</div>
                    </div>
                  </div>
                  <Card.Body className="text-center">
                    <h5 className="category-title">{category.name}</h5>
                    <p className="category-count">{category.count} Products</p>
                    <Button
                      variant="outline-primary"
                      as={Link}
                      to={`/shop?category=${category.name}`}
                    >
                      Explore
                      <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Featured Products Section */}
      <section className="featured-products-section py-5">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="section-title">Featured Products</h2>
              <p className="section-subtitle">
                Handpicked fresh products for you
              </p>
            </Col>
          </Row>
          <Row>
            {featuredProducts.map((product) => (
              <Col lg={3} md={6} className="mb-4" key={product.id}>
                <Card className="product-card h-100">
                  <div className="product-image-container">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="product-image"
                    />
                    <div className="product-badges">
                      {product.stock <= 10 && product.stock > 0 && (
                        <Badge bg="warning" className="stock-badge">
                          <FontAwesomeIcon icon={faClock} className="me-1" />
                          Low Stock
                        </Badge>
                      )}
                      {product.stock > 50 && (
                        <Badge bg="success" className="stock-badge">
                          <FontAwesomeIcon
                            icon={faCheckCircle}
                            className="me-1"
                          />
                          In Stock
                        </Badge>
                      )}
                    </div>
                    <div className="product-actions">
                      <Button variant="light" size="sm" className="action-btn">
                        <FontAwesomeIcon icon={farHeart} />
                      </Button>
                      <Button
                        variant="light"
                        size="sm"
                        className="action-btn"
                        as={Link}
                        to={`/products/${product.id}`}
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </Button>
                    </div>
                  </div>
                  <Card.Body>
                    <div className="product-info">
                      <div className="product-category">{product.category}</div>
                      <h6 className="product-title">{product.name}</h6>
                      <div className="product-rating">
                        <div className="rating-stars">
                          {[...Array(5)].map((_, i) => (
                            <FontAwesomeIcon
                              key={i}
                              icon={faStar}
                              className={
                                i < Math.floor(product.rating)
                                  ? "text-warning"
                                  : "text-muted"
                              }
                            />
                          ))}
                        </div>
                        <span className="rating-text">
                          {product.rating} (120)
                        </span>
                      </div>
                      <div className="product-price">
                        <span className="current-price">
                          ₨{product.price.toLocaleString()}
                        </span>
                        {product.originalPrice && (
                          <>
                            <span className="original-price">
                              ₨{product.originalPrice.toLocaleString()}
                            </span>
                            <span className="discount-badge">
                              {product.discount}% OFF
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="product-actions-bottom">
                      <Button variant="primary" className="add-to-cart-btn">
                        <FontAwesomeIcon icon={faShoppingCart} />
                        Add to Cart
                      </Button>
                      <Button
                        variant="outline-secondary"
                        className="quick-view-btn"
                        as={Link}
                        to={`/products/${product.id}`}
                      >
                        <FontAwesomeIcon icon={faEye} />
                        Quick View
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          <Row className="text-center mt-4">
            <Col>
              <Button variant="outline-primary" size="lg" as={Link} to="/shop">
                View All Products
                <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
              </Button>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section py-5 bg-light">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="section-title">What Our Customers Say</h2>
              <p className="section-subtitle">
                Don't just take our word for it
              </p>
            </Col>
          </Row>
          <Row>
            {testimonials.map((testimonial) => (
              <Col lg={4} md={6} className="mb-4" key={testimonial.id}>
                <Card className="testimonial-card h-100">
                  <Card.Body className="text-center">
                    <div className="testimonial-avatar">
                      <img src={testimonial.avatar} alt={testimonial.name} />
                    </div>
                    <div className="testimonial-rating mb-3">
                      {[...Array(5)].map((_, i) => (
                        <FontAwesomeIcon
                          key={i}
                          icon={faStar}
                          className="text-warning"
                        />
                      ))}
                    </div>
                    <blockquote className="testimonial-content">
                      <FontAwesomeIcon
                        icon={faQuoteLeft}
                        className="quote-icon"
                      />
                      {testimonial.content}
                    </blockquote>
                    <div className="testimonial-author">
                      <h6 className="mb-1">{testimonial.name}</h6>
                      <small className="text-muted">{testimonial.role}</small>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section py-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={8} className="text-center text-lg-start">
              <h2 className="cta-title">Ready to Start Shopping?</h2>
              <p className="cta-subtitle">
                Join thousands of satisfied customers who trust us for their
                daily groceries
              </p>
            </Col>
            <Col lg={4} className="text-center text-lg-end">
              <Button
                variant="light"
                size="lg"
                as={Link}
                to="/shop"
                style={{
                  background: "rgba(255, 255, 255, 0.9)",
                  border: "none",
                  color: "#38e07b",
                  fontWeight: "600",
                  padding: "0.75rem 2rem",
                  borderRadius: "12px",
                  transition: "all 0.3s ease",
                }}
              >
                Start Shopping Now
                <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
              </Button>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Home;
