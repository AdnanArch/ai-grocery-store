import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";

const Home = () => {
  const [featuredProducts] = useState([
    {
      id: 1,
      name: "Organic Fresh Vegetables",
      price: 12.99,
      originalPrice: 15.99,
      image:
        "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop",
      category: "Vegetables",
      rating: 4.8,
      discount: 20,
    },
    {
      id: 2,
      name: "Premium Dairy Products",
      price: 8.5,
      originalPrice: 10.0,
      image:
        "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop",
      category: "Dairy",
      rating: 4.9,
      discount: 15,
    },
    {
      id: 3,
      name: "Fresh Bakery Items",
      price: 6.99,
      originalPrice: 8.99,
      image:
        "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop",
      category: "Bakery",
      rating: 4.7,
      discount: 25,
    },
    {
      id: 4,
      name: "Organic Fruits Bundle",
      price: 18.99,
      originalPrice: 24.99,
      image:
        "https://images.unsplash.com/photo-1619566636858-adf3f41a0c0a?w=400&h=300&fit=crop",
      category: "Fruits",
      rating: 4.6,
      discount: 24,
    },
  ]);

  const [categories] = useState([
    { name: "Fresh Produce", icon: "🥬", count: 150, color: "#4ade80" },
    { name: "Dairy & Eggs", icon: "🥛", count: 89, color: "#fbbf24" },
    { name: "Meat & Seafood", icon: "🥩", count: 67, color: "#f87171" },
    { name: "Pantry Essentials", icon: "🍯", count: 234, color: "#a78bfa" },
    { name: "Beverages", icon: "🥤", count: 112, color: "#60a5fa" },
    { name: "Frozen Foods", icon: "🧊", count: 78, color: "#34d399" },
  ]);

  return (
    <div
      className="home-page"
      style={{
        background: "#f8fbfa",
        fontFamily: "'Plus Jakarta Sans', 'Noto Sans', sans-serif",
        minHeight: "100vh",
      }}
    >
      {/* Hero Section */}
      <section
        className="hero-section d-flex align-items-center"
        style={{
          background: "linear-gradient(135deg, #f8fbfa 0%, #e0f7fa 100%)",
          color: "#0e1a13",
          minHeight: "100vh",
          padding: 0,
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 8px 32px 0 rgba(16, 185, 129, 0.1)",
        }}
      >
        <div
          className="hero-pattern"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'url(\'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%2310b981" fill-opacity="0.08"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\')',
            opacity: 0.25,
            zIndex: 0,
          }}
        ></div>
        <Container style={{ position: "relative", zIndex: 1 }}>
          <Row
            className="align-items-center justify-content-center"
            style={{ minHeight: "100vh" }}
          >
            <Col
              lg={6}
              className="mb-5 mb-lg-0 d-flex flex-column justify-content-center"
              style={{ minHeight: "60vh" }}
            >
              <div className="hero-content px-2 px-md-4">
                <Badge
                  bg="warning"
                  className="mb-3 px-3 py-2"
                  style={{
                    fontSize: "1rem",
                    fontWeight: "600",
                    color: "#b45309",
                    background: "#fef3c7",
                  }}
                >
                  🥦 Fresh, Fast & Smart
                </Badge>
                <h1
                  className="display-4 fw-bold mb-4"
                  style={{ lineHeight: "1.15", color: "#0e1a13" }}
                >
                  Grocery Shopping
                  <span className="d-block" style={{ color: "#10b981" }}>
                    Reinvented by AI
                  </span>
                </h1>
                <p
                  className="lead mb-4"
                  style={{
                    fontSize: "1.2rem",
                    color: "#374151",
                    opacity: 0.92,
                  }}
                >
                  Discover fresh groceries, smart recommendations, and seamless
                  delivery. Shop smarter, live better.
                </p>
                <div className="d-flex flex-column flex-sm-row gap-3 mb-2">
                  <Button
                    as={Link}
                    to="/register"
                    size="lg"
                    className="btn-custom w-100 w-sm-auto"
                    style={{
                      background:
                        "linear-gradient(90deg, #10b981 0%, #34d399 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: "12px",
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      boxShadow: "0 4px 15px rgba(16, 185, 129, 0.18)",
                    }}
                  >
                    Start Shopping Now
                  </Button>
                  <Button
                    as={Link}
                    to="/shop"
                    variant="outline-success"
                    size="lg"
                    className="btn-custom w-100 w-sm-auto"
                    style={{
                      borderRadius: "12px",
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      borderWidth: "2px",
                      color: "#10b981",
                      borderColor: "#10b981",
                      background: "white",
                    }}
                  >
                    Browse Products
                  </Button>
                </div>
              </div>
            </Col>
            <Col
              lg={6}
              className="d-flex justify-content-center align-items-center"
              style={{ minHeight: "60vh" }}
            >
              <div
                className="hero-image text-center p-4 p-md-5"
                style={{ width: "100%", maxWidth: 420 }}
              >
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #fef3c7 0%, #a7f3d0 100%)",
                    borderRadius: "20px",
                    padding: "40px 20px",
                    position: "relative",
                    boxShadow: "0 25px 50px -12px rgba(16, 185, 129, 0.10)",
                  }}
                >
                  <div style={{ fontSize: "7rem", marginBottom: "20px" }}>
                    🛒
                  </div>
                  <h3 className="fw-bold mb-2" style={{ color: "#0e1a13" }}>
                    Smart Cart
                  </h3>
                  <p className="mb-0" style={{ color: "#10b981" }}>
                    AI-powered recommendations
                  </p>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section
        className="features-section py-5"
        style={{ background: "white" }}
      >
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="fw-bold mb-3" style={{ color: "#1e293b" }}>
                Why Choose SmartShop?
              </h2>
              <p className="lead text-muted">
                Experience the future of grocery shopping with our innovative
                features
              </p>
            </Col>
          </Row>
          <Row className="g-4">
            <Col md={4}>
              <div className="text-center p-4">
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    background:
                      "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                    fontSize: "2rem",
                  }}
                >
                  🤖
                </div>
                <h4 className="fw-bold mb-3" style={{ color: "#1e293b" }}>
                  AI Recommendations
                </h4>
                <p className="text-muted">
                  Get personalized product suggestions based on your preferences
                  and shopping history
                </p>
              </div>
            </Col>
            <Col md={4}>
              <div className="text-center p-4">
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    background:
                      "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                    fontSize: "2rem",
                  }}
                >
                  ⚡
                </div>
                <h4 className="fw-bold mb-3" style={{ color: "#1e293b" }}>
                  Fast Delivery
                </h4>
                <p className="text-muted">
                  Same-day delivery available for fresh groceries and household
                  essentials
                </p>
              </div>
            </Col>
            <Col md={4}>
              <div className="text-center p-4">
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    background:
                      "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                    fontSize: "2rem",
                  }}
                >
                  🌱
                </div>
                <h4 className="fw-bold mb-3" style={{ color: "#1e293b" }}>
                  Fresh & Organic
                </h4>
                <p className="text-muted">
                  Premium quality products sourced from local farms and trusted
                  suppliers
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Categories Section */}
      <section
        className="categories-section py-5"
        style={{ background: "#f8fafc" }}
      >
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="fw-bold mb-3" style={{ color: "#1e293b" }}>
                Shop by Category
              </h2>
              <p className="lead text-muted">
                Explore our wide range of grocery categories
              </p>
            </Col>
          </Row>
          <Row className="g-4">
            {categories.map((category, index) => (
              <Col key={index} xs={6} md={4} lg={2}>
                <Link to="/shop" className="text-decoration-none">
                  <Card
                    className="h-100 text-center border-0 shadow-sm"
                    style={{
                      borderRadius: "16px",
                      transition: "transform 0.2s ease-in-out",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = "translateY(-5px)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = "translateY(0)")
                    }
                  >
                    <Card.Body className="p-4">
                      <div style={{ fontSize: "3rem", marginBottom: "15px" }}>
                        {category.icon}
                      </div>
                      <h6 className="fw-bold mb-2" style={{ color: "#1e293b" }}>
                        {category.name}
                      </h6>
                      <p
                        className="text-muted mb-0"
                        style={{ fontSize: "0.9rem" }}
                      >
                        {category.count} items
                      </p>
                    </Card.Body>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Featured Products Section */}
      <section
        className="featured-products py-5"
        style={{ background: "white" }}
      >
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="fw-bold mb-3" style={{ color: "#1e293b" }}>
                Featured Products
              </h2>
              <p className="lead text-muted">Handpicked products for you</p>
            </Col>
          </Row>
          <Row className="g-4">
            {featuredProducts.map((product) => (
              <Col key={product.id} xs={12} sm={6} lg={3}>
                <Card
                  className="h-100 border-0 shadow-sm"
                  style={{
                    borderRadius: "16px",
                    overflow: "hidden",
                    transition: "transform 0.2s ease-in-out",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "translateY(-5px)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "translateY(0)")
                  }
                >
                  <div style={{ position: "relative" }}>
                    <Card.Img
                      variant="top"
                      src={product.image}
                      style={{ height: "200px", objectFit: "cover" }}
                    />
                    <Badge
                      bg="danger"
                      style={{
                        position: "absolute",
                        top: "10px",
                        left: "10px",
                        fontSize: "0.8rem",
                      }}
                    >
                      -{product.discount}%
                    </Badge>
                  </div>
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-center mb-2">
                      <Badge
                        bg="light"
                        text="dark"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {product.category}
                      </Badge>
                      <div className="ms-auto d-flex align-items-center">
                        <span style={{ fontSize: "0.9rem", color: "#fbbf24" }}>
                          ★
                        </span>
                        <span
                          className="ms-1"
                          style={{ fontSize: "0.9rem", color: "#6b7280" }}
                        >
                          {product.rating}
                        </span>
                      </div>
                    </div>
                    <h6 className="fw-bold mb-2" style={{ color: "#1e293b" }}>
                      {product.name}
                    </h6>
                    <div className="d-flex align-items-center">
                      <span
                        className="fw-bold text-success me-2"
                        style={{ fontSize: "1.1rem" }}
                      >
                        ${product.price}
                      </span>
                      <span
                        className="text-muted text-decoration-line-through"
                        style={{ fontSize: "0.9rem" }}
                      >
                        ${product.originalPrice}
                      </span>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          <Row className="text-center mt-5">
            <Col>
              <Link to="/shop">
                <Button
                  variant="outline-success"
                  size="lg"
                  className="px-4 py-3 fw-bold"
                  style={{
                    borderRadius: "12px",
                    fontSize: "1.1rem",
                    borderWidth: "2px",
                  }}
                >
                  View All Products
                </Button>
              </Link>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section
        className="cta-section py-5"
        style={{
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          color: "white",
        }}
      >
        <Container>
          <Row className="text-center align-items-center">
            <Col lg={8} className="mb-4 mb-lg-0">
              <h2 className="fw-bold mb-3">Ready to Start Shopping?</h2>
              <p className="lead mb-0" style={{ opacity: 0.9 }}>
                Join thousands of satisfied customers who trust SmartShop for
                their grocery needs
              </p>
            </Col>
            <Col lg={4} className="text-center text-lg-end">
              <Link to="/register">
                <Button
                  size="lg"
                  className="px-4 py-3 fw-bold"
                  style={{
                    background: "white",
                    color: "#10b981",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "1.1rem",
                  }}
                >
                  Get Started Today
                </Button>
              </Link>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Home;
