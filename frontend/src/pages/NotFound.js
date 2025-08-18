import React from "react";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle,
  faHome,
  faShoppingBag,
} from "@fortawesome/free-solid-svg-icons";

const NotFound = () => {
  return (
    <div
      style={{
        background: "#f8fbfa",
        fontFamily: "'Plus Jakarta Sans', 'Noto Sans', sans-serif",
        minHeight: "100vh",
      }}
    >
      <Container
        className="py-5 my-5 d-flex align-items-center justify-content-center"
        style={{ minHeight: 400 }}
      >
      <Row className="justify-content-center w-100">
        <Col md={8} lg={6}>
          <Card
            className="p-5 shadow glass-404 border-0 text-center"
            style={{
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(8px)",
            }}
          >
            <div className="mb-4">
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                size="4x"
                className="text-warning mb-3"
              />
              <h1 
                className="display-4 fw-bold"
                style={{ color: "#0e1a13" }}
              >
                404
              </h1>
              <h2 
                className="mb-4 fw-bold"
                style={{ color: "#0e1a13", fontSize: "2rem" }}
              >
                Page Not Found
              </h2>
              <p className="lead text-muted mb-5">
                The page you are looking for might have been removed, had its
                name changed, or is temporarily unavailable.
              </p>
            </div>
            <div className="d-flex flex-column flex-md-row justify-content-center gap-3">
              <Button
                as={Link}
                to="/"
                variant="primary"
                size="lg"
                className="mb-3 mb-md-0 rounded-pill px-4"
              >
                <FontAwesomeIcon icon={faHome} className="me-2" />
                Go to Homepage
              </Button>
              <Button
                as={Link}
                to="/products"
                variant="outline-primary"
                size="lg"
                className="rounded-pill px-4"
              >
                <FontAwesomeIcon icon={faShoppingBag} className="me-2" />
                Browse Products
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
    </div>
  );
};

export default NotFound;
