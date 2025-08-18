import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLeaf,
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
  faFacebook,
  faTwitter,
  faInstagram,
  faLinkedin,
  faHeart,
  faShieldAlt,
  faTruck,
  faHeadset,
  faCreditCard,
  faMobileAlt,
  faShippingFast,
  faLock,
  faClock,
  faUndo,
  faMobile,
} from "@fortawesome/free-solid-svg-icons";
import {
  faFacebookF,
  faTwitter as faTwitterBrand,
  faInstagram as faInstagramBrand,
  faLinkedinIn,
} from "@fortawesome/free-brands-svg-icons";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="modern-footer">
      {/* Main Footer Content */}
      <div className="footer-main">
        <Container>
          <Row className="g-5">
            {/* Company Info */}
            <Col lg={4} md={6} className="mb-4">
              <div className="footer-brand mb-4">
                <div className="brand-logo">
                  <FontAwesomeIcon icon={faLeaf} className="brand-icon" />
                  <span className="brand-text">SmartShop</span>
                </div>
                <p className="company-description">
                  Your AI-powered grocery shopping assistant. Discover fresh,
                  quality groceries with personalized recommendations and
                  lightning-fast delivery to your doorstep.
                </p>
              </div>

              <div className="contact-info">
                <div className="contact-item">
                  <FontAwesomeIcon icon={faPhone} className="contact-icon" />
                  <div>
                    <h6>Phone</h6>
                    <p>0308-5038859</p>
                  </div>
                </div>
                <div className="contact-item">
                  <FontAwesomeIcon icon={faEnvelope} className="contact-icon" />
                  <div>
                    <h6>Email</h6>
                    <p>adnanrafique.dev@gmail.com</p>
                  </div>
                </div>
              </div>
            </Col>

            {/* Quick Links */}
            <Col lg={2} md={6} className="mb-4">
              <h5 className="footer-title">Quick Links</h5>
              <ul className="footer-links">
                <li>
                  <Link to="/shop">Shop Products</Link>
                </li>
                <li>
                  <Link to="/orders">My Orders</Link>
                </li>
                <li>
                  <Link to="/account">My Account</Link>
                </li>
                <li>
                  <Link to="/cart">Shopping Cart</Link>
                </li>
                <li>
                  <Link to="/wishlist">Wishlist</Link>
                </li>
                <li>
                  <Link to="/ai-recommendations">AI Recommendations</Link>
                </li>
              </ul>
            </Col>

            {/* Categories */}
            <Col lg={2} md={6} className="mb-4">
              <h5 className="footer-title">Categories</h5>
              <ul className="footer-links">
                <li>
                  <Link to="/shop">Fresh Produce</Link>
                </li>
                <li>
                  <Link to="/shop">Dairy & Eggs</Link>
                </li>
                <li>
                  <Link to="/shop">Meat & Seafood</Link>
                </li>
                <li>
                  <Link to="/shop">Pantry Essentials</Link>
                </li>
                <li>
                  <Link to="/shop">Beverages</Link>
                </li>
                <li>
                  <Link to="/shop">Organic Products</Link>
                </li>
              </ul>
            </Col>

            {/* Support */}
            <Col lg={2} md={6} className="mb-4">
              <h5 className="footer-title">Support</h5>
              <ul className="footer-links">
                <li>
                  <Link to="/help">Help Center</Link>
                </li>
                <li>
                  <Link to="/contact">Contact Us</Link>
                </li>
                <li>
                  <Link to="/faq">FAQ</Link>
                </li>
                <li>
                  <Link to="/shipping">Shipping Info</Link>
                </li>
                <li>
                  <Link to="/returns">Returns</Link>
                </li>
                <li>
                  <Link to="/track-order">Track Order</Link>
                </li>
              </ul>
            </Col>

            {/* Features */}
            <Col lg={2} md={6} className="mb-4">
              <h5 className="footer-title">Features</h5>
              <div className="features-list">
                <div className="feature-item">
                  <span>Free Delivery</span>
                </div>
                <div className="feature-item">
                  <span>Secure Payment</span>
                </div>
                <div className="feature-item">
                  <span>24/7 Support</span>
                </div>
                <div className="feature-item">
                  <span>Easy Returns</span>
                </div>
                <div className="feature-item">
                  <span>Mobile App</span>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <Container>
          <Row className="align-items-center">
            <Col md={6} className="text-center text-md-start mb-3 mb-md-0">
              <p className="copyright">
                &copy; {currentYear} SmartShop. All rights reserved.
              </p>
            </Col>
            <Col md={6} className="text-center text-md-end">
              <div className="social-links">
                <a href="#" className="social-link" aria-label="Facebook">
                  <FontAwesomeIcon icon={faFacebookF} />
                </a>
                <a href="#" className="social-link" aria-label="Twitter">
                  <FontAwesomeIcon icon={faTwitterBrand} />
                </a>
                <a href="#" className="social-link" aria-label="Instagram">
                  <FontAwesomeIcon icon={faInstagramBrand} />
                </a>
                <a href="#" className="social-link" aria-label="LinkedIn">
                  <FontAwesomeIcon icon={faLinkedinIn} />
                </a>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </footer>
  );
};

export default Footer;
