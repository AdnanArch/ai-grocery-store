import React, { useContext } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Navbar,
  Nav,
  Container,
  Badge,
  Button,
  Dropdown,
  Image,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faShoppingBag,
  faReceipt,
  faHeart,
  faRobot,
  faUserCog,
  faSignOutAlt,
  faShoppingCart,
  faUser,
  faCog,
  faLeaf,
} from "@fortawesome/free-solid-svg-icons";
import { AuthContext } from "../../context/AuthContext";
import { CartContext } from "../../context/CartContext";
import RealTimeNotifications from "../ui/RealTimeNotifications";

const Header = () => {
  const { isAuthenticated, user, logout, isAdmin } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 1000 }}>
      <Navbar
        expand="lg"
        className="modern-navbar"
        style={{
          background: "rgba(255, 255, 255, 0.98)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(56, 224, 123, 0.1)",
          fontFamily: "'Plus Jakarta Sans', 'Noto Sans', sans-serif",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          width: "100%",
        }}
      >
        <Container>
          <Navbar.Brand
            as={Link}
            to="/"
            className="brand-logo"
            style={{
              fontFamily: "inherit",
              fontSize: "1.8rem",
              fontWeight: "700",
              color: "#0e1a13",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <div className="logo-container">
              <div className="logo-icon">
                <FontAwesomeIcon
                  icon={faLeaf}
                  className="logo-leaf"
                  style={{
                    color: "#38e07b",
                    fontSize: "1.8rem",
                    position: "relative",
                    zIndex: 2,
                  }}
                />
                <FontAwesomeIcon
                  icon={faShoppingCart}
                  className="logo-cart"
                  style={{
                    color: "#6366f1",
                    fontSize: "1.2rem",
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 1,
                  }}
                />
              </div>
              <span className="logo-text">FreshCart</span>
            </div>
          </Navbar.Brand>

          <Navbar.Toggle
            aria-controls="basic-navbar-nav"
            className="navbar-toggler"
            style={{
              border: "2px solid #e5e7eb",
              borderRadius: "8px",
              padding: "0.5rem",
            }}
          />

          <Navbar.Collapse id="basic-navbar-nav">
            <Nav
              className="me-auto nav-links"
              style={{ gap: "0.5rem", flexWrap: "nowrap" }}
            >
              <Nav.Link
                as={NavLink}
                to="/shop"
                className="nav-link-item"
                style={{
                  fontFamily: "inherit",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  color: "#0e1a13",
                  padding: "0.6rem 1rem",
                  borderRadius: "12px",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  marginRight: "0.3rem",
                  whiteSpace: "nowrap",
                }}
              >
                <FontAwesomeIcon
                  icon={faShoppingBag}
                  style={{ fontSize: "0.85rem" }}
                />
                Shop
              </Nav.Link>
              <Nav.Link
                as={NavLink}
                to="/orders"
                className="nav-link-item"
                style={{
                  fontFamily: "inherit",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  color: "#0e1a13",
                  padding: "0.6rem 1rem",
                  borderRadius: "12px",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  marginRight: "0.3rem",
                  whiteSpace: "nowrap",
                }}
              >
                <FontAwesomeIcon
                  icon={faReceipt}
                  style={{ fontSize: "0.85rem" }}
                />
                Orders
              </Nav.Link>
              <Nav.Link
                as={NavLink}
                to="/wishlist"
                className="nav-link-item"
                style={{
                  fontFamily: "inherit",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  color: "#0e1a13",
                  padding: "0.6rem 1rem",
                  borderRadius: "12px",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  marginRight: "0.3rem",
                  whiteSpace: "nowrap",
                }}
              >
                <FontAwesomeIcon
                  icon={faHeart}
                  style={{ fontSize: "0.85rem" }}
                />
                Wishlist
              </Nav.Link>
              <Nav.Link
                as={NavLink}
                to="/ai-recommendations"
                className="nav-link-item"
                style={{
                  fontFamily: "inherit",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  color: "#0e1a13",
                  padding: "0.6rem 1rem",
                  borderRadius: "12px",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  marginRight: "0.3rem",
                  whiteSpace: "nowrap",
                }}
              >
                <FontAwesomeIcon
                  icon={faRobot}
                  style={{ fontSize: "0.85rem" }}
                />
                AI Recs
              </Nav.Link>
              <Nav.Link
                as={NavLink}
                to="/ai-chat"
                className="nav-link-item"
                style={{
                  fontFamily: "inherit",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  color: "#0e1a13",
                  padding: "0.6rem 1rem",
                  borderRadius: "12px",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  marginRight: "0.3rem",
                  whiteSpace: "nowrap",
                }}
              >
                <FontAwesomeIcon
                  icon={faRobot}
                  style={{ fontSize: "0.85rem" }}
                />
                AI Chat
              </Nav.Link>
              {isAdmin && (
                <Nav.Link
                  as={NavLink}
                  to="/admin"
                  className="nav-link-item admin-link"
                  style={{
                    fontFamily: "inherit",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    color: "#0e1a13",
                    padding: "0.6rem 1rem",
                    borderRadius: "12px",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    marginRight: "0.3rem",
                    background: "rgba(56, 224, 123, 0.1)",
                    whiteSpace: "nowrap",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faCog}
                    style={{ fontSize: "0.85rem" }}
                  />
                  Admin
                </Nav.Link>
              )}
            </Nav>

            <Nav
              className="nav-actions"
              style={{ gap: "1rem", alignItems: "center" }}
            >
              {/* Real-time Notifications */}
              {isAuthenticated && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    position: "relative",
                  }}
                >
                  <RealTimeNotifications />
                </div>
              )}

              {/* Shopping Cart */}
              <Link
                to="/cart"
                className="cart-link"
                style={{
                  textDecoration: "none",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Button
                  variant="outline-success"
                  size="sm"
                  className="cart-button"
                  style={{
                    borderRadius: "12px",
                    borderWidth: "2px",
                    borderColor: "#38e07b",
                    padding: "0.75rem 1rem",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    transition: "all 0.3s ease",
                    background: "white",
                    color: "#38e07b",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faShoppingCart}
                    style={{ fontSize: "1rem" }}
                  />
                  <span>Cart</span>
                  {cartCount > 0 && (
                    <Badge
                      bg="danger"
                      className="cart-badge"
                      style={{
                        position: "absolute",
                        top: "-8px",
                        right: "-8px",
                        fontSize: "0.7rem",
                        minWidth: "20px",
                        height: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "10px",
                        fontWeight: "600",
                      }}
                    >
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              {!isAuthenticated && (
                <div
                  className="auth-buttons"
                  style={{ display: "flex", gap: "0.75rem" }}
                >
                  <Link to="/login">
                    <Button
                      variant="outline-success"
                      size="sm"
                      className="login-btn"
                      style={{
                        borderRadius: "12px",
                        borderWidth: "2px",
                        borderColor: "#38e07b",
                        padding: "0.75rem 1.5rem",
                        fontWeight: "600",
                        background: "white",
                        color: "#38e07b",
                        transition: "all 0.3s ease",
                      }}
                    >
                      Log in
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button
                      size="sm"
                      className="signup-btn"
                      style={{
                        background:
                          "linear-gradient(135deg, #38e07b 0%, #10b981 100%)",
                        border: "none",
                        borderRadius: "12px",
                        padding: "0.75rem 1.5rem",
                        fontWeight: "600",
                        transition: "all 0.3s ease",
                        boxShadow: "0 4px 12px rgba(56, 224, 123, 0.3)",
                      }}
                    >
                      Sign up
                    </Button>
                  </Link>
                </div>
              )}

              {isAuthenticated && (
                <div
                  className="user-section"
                  style={{ display: "flex", alignItems: "center", gap: "1rem" }}
                >
                  <Dropdown>
                    <Dropdown.Toggle
                      variant="link"
                      className="user-dropdown-toggle"
                      style={{
                        textDecoration: "none",
                        padding: "0",
                        border: "none",
                        background: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "none",
                      }}
                    >
                      <div
                        className="user-avatar"
                        style={{ position: "relative" }}
                      >
                        {user?.profilePicture ? (
                          <Image
                            src={user.profilePicture}
                            alt={user.name || "User"}
                            roundedCircle
                            style={{
                              width: "45px",
                              height: "45px",
                              objectFit: "cover",
                              border: "3px solid #38e07b",
                              cursor: "pointer",
                              transition: "all 0.3s ease",
                            }}
                          />
                        ) : (
                          <div
                            className="default-avatar"
                            style={{
                              width: "45px",
                              height: "45px",
                              borderRadius: "50%",
                              background:
                                "linear-gradient(135deg, #38e07b 0%, #10b981 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              fontWeight: "600",
                              fontSize: "1.1rem",
                              border: "3px solid #38e07b",
                              cursor: "pointer",
                              transition: "all 0.3s ease",
                            }}
                          >
                            {user?.name
                              ? user.name.charAt(0).toUpperCase()
                              : "U"}
                          </div>
                        )}
                      </div>
                    </Dropdown.Toggle>

                    <Dropdown.Menu
                      align="start"
                      className="user-dropdown-menu"
                      style={{
                        borderRadius: "16px",
                        border: "1px solid #e5e7eb",
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
                        padding: "0.5rem",
                        minWidth: "200px",
                        marginTop: "0.5rem",
                        left: "0",
                        right: "auto",
                        transform: "translateX(-40%)",
                      }}
                    >
                      <Dropdown.Header
                        style={{
                          fontWeight: "600",
                          color: "#0e1a13",
                          fontSize: "0.9rem",
                          padding: "0.75rem 1rem",
                          borderBottom: "1px solid #f3f4f6",
                        }}
                      >
                        Account Settings
                      </Dropdown.Header>

                      <Dropdown.Item
                        as={Link}
                        to="/account"
                        className="dropdown-item"
                        style={{
                          borderRadius: "8px",
                          padding: "0.75rem 1rem",
                          color: "#0e1a13",
                          fontWeight: "500",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faUserCog}
                          style={{ color: "#38e07b" }}
                        />
                        Profile
                      </Dropdown.Item>

                      <Dropdown.Item
                        as={Link}
                        to="/reset-password"
                        className="dropdown-item"
                        style={{
                          borderRadius: "8px",
                          padding: "0.75rem 1rem",
                          color: "#0e1a13",
                          fontWeight: "500",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faCog}
                          style={{ color: "#38e07b" }}
                        />
                        Reset Password
                      </Dropdown.Item>

                      <Dropdown.Divider style={{ margin: "0.5rem 0" }} />

                      <Dropdown.Item
                        onClick={handleLogout}
                        className="dropdown-item logout-item"
                        style={{
                          borderRadius: "8px",
                          padding: "0.75rem 1rem",
                          color: "#ef4444",
                          fontWeight: "500",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <FontAwesomeIcon icon={faSignOutAlt} />
                        Logout
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
