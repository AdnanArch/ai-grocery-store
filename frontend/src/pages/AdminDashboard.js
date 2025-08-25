import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Modal,
  Form,
  Alert,
  Badge,
  Nav,
  Tab,
  Spinner,
  Dropdown,
  ButtonGroup,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faShoppingCart,
  faBox,
  faDollarSign,
  faPlus,
  faEdit,
  faTrash,
  faEye,
  faSync,
  faChartLine,
  faUserShield,
  faUserCheck,
  faUserTimes,
} from "@fortawesome/free-solid-svg-icons";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getOrderStatusBadge,
  getOrderStatusBadgeColor,
} from "../utils/statusUtils";

const AdminDashboard = () => {
  const { user, isAdmin } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
  });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Admin creation state
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminFormData, setAdminFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
  });

  // Check if user is admin
  useEffect(() => {
    if (user && !isAdmin) {
      toast.error("Access denied. Admin privileges required.");
      window.location.href = "/";
    }
  }, [user, isAdmin]);

  // Fetch dashboard data
  useEffect(() => {
    if (isAdmin) {
      fetchDashboardData();
    }
  }, [isAdmin]);

  // Auto-refresh stats every 30 seconds
  useEffect(() => {
    if (isAdmin) {
      const interval = setInterval(() => {
        fetchStatsOnly();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  // Debug stats state changes
  useEffect(() => {
    console.log("Stats state updated:", stats);
  }, [stats]);

  const fetchStatsOnly = async () => {
    try {
      const statsResponse = await api.get("/api/admin/stats");
      console.log("Stats refresh response:", statsResponse.data);

      // Validate stats data
      if (statsResponse.data && typeof statsResponse.data === "object") {
        const statsData = {
          totalUsers: Number(statsResponse.data.totalUsers) || 0,
          totalProducts: Number(statsResponse.data.totalProducts) || 0,
          totalOrders: Number(statsResponse.data.totalOrders) || 0,
          totalRevenue: Number(statsResponse.data.totalRevenue) || 0,
        };
        console.log("Processed stats refresh data:", statsData);
        setStats(statsData);
      } else {
        console.error(
          "Invalid stats refresh response format:",
          statsResponse.data
        );
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch statistics
      const statsResponse = await api.get("/api/admin/stats");
      console.log("Stats response:", statsResponse.data);

      // Validate stats data
      if (statsResponse.data && typeof statsResponse.data === "object") {
        const statsData = {
          totalUsers: Number(statsResponse.data.totalUsers) || 0,
          totalOrders: Number(statsResponse.data.totalOrders) || 0,
          totalProducts: Number(statsResponse.data.totalProducts) || 0,
          totalRevenue: Number(statsResponse.data.totalRevenue) || 0,
        };
        console.log("Processed stats data:", statsData);
        setStats(statsData);
      } else {
        console.error("Invalid stats response format:", statsResponse.data);
        toast.error("Invalid stats data received");
      }

      // Fetch products
      const productsResponse = await api.get("/api/admin/products");
      setProducts(productsResponse.data);

      // Fetch orders
      const ordersResponse = await api.get("/api/admin/orders");
      setOrders(ordersResponse.data);

      // Fetch users
      const usersResponse = await api.get("/api/admin/users");
      setUsers(usersResponse.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    toast.success("Dashboard refreshed successfully!", { autoClose: 4000 });
  };

  const handleProductSubmit = async (productData) => {
    try {
      // Format the product data for the backend
      const formattedProductData = {
        name: productData.name,
        description: productData.description,
        price: parseFloat(productData.price),
        stock: parseInt(productData.stock),
        category: productData.categoryId
          ? { id: parseInt(productData.categoryId) }
          : null,
        imageUrl: productData.imageUrl || null,
        imageAltText: productData.imageAltText || null,
      };

      let savedProduct;
      if (selectedProduct) {
        savedProduct = await api.put(
          `/api/admin/products/${selectedProduct.id}`,
          formattedProductData
        );
        toast.success("Product updated successfully", { autoClose: 4000 });
      } else {
        savedProduct = await api.post(
          "/api/admin/products",
          formattedProductData
        );
        toast.success("Product created successfully", { autoClose: 4000 });
      }

      setShowProductModal(false);
      setSelectedProduct(null);
      fetchDashboardData();
    } catch (error) {
      console.error("Product save error:", error);
      toast.error(error.response?.data?.message || "Failed to save product", {
        autoClose: 8000,
      });
    }
  };

  const handleOrderStatusUpdate = async (orderId, status) => {
    try {
      await api.put(`/api/admin/orders/${orderId}/status`, { status });
      toast.success("Order status updated", { autoClose: 4000 });
      fetchDashboardData();
    } catch (error) {
      toast.error("Failed to update order status", { autoClose: 8000 });
    }
  };

  const handleUserStatusToggle = async (userId, active, userName) => {
    const action = active ? "activate" : "deactivate";
    const confirmed = window.confirm(
      `Are you sure you want to ${action} the user "${userName}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.put(`/api/admin/users/${userId}/status`, { active });
      toast.success(`User ${action}d successfully`);
      fetchDashboardData();
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  const handleAdminStatusToggle = async (adminId, active, adminName) => {
    const action = active ? "activate" : "deactivate";
    const confirmed = window.confirm(
      `Are you sure you want to ${action} the admin "${adminName}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.put(`/api/admin/admins/${adminId}/status`, { active });
      toast.success(`Admin ${action}d successfully`);
      fetchDashboardData();
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to update admin status";
      toast.error(errorMessage);
    }
  };

  const handleAdminCreation = async (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !adminFormData.email ||
      !adminFormData.password ||
      !adminFormData.firstName ||
      !adminFormData.lastName
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (adminFormData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      const response = await api.post(
        "/api/admin/users/create-admin",
        adminFormData
      );
      toast.success("Admin user created successfully");
      setShowAdminModal(false);
      setAdminFormData({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        phone: "",
      });
      fetchDashboardData();
    } catch (error) {
      console.error("Admin creation error:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to create admin user";
      toast.error(errorMessage);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await api.delete(`/api/admin/products/${productId}`);
        toast.success("Product deleted successfully", { autoClose: 4000 });
        fetchDashboardData();
      } catch (error) {
        toast.error("Failed to delete product", { autoClose: 8000 });
      }
    }
  };

  if (!isAdmin) {
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
      className="admin-dashboard d-flex flex-column min-vh-100"
      style={{
        background: "linear-gradient(135deg, #f8fbfa 0%, #e8f5e8 100%)",
        fontFamily: "'Plus Jakarta Sans', 'Noto Sans', sans-serif",
      }}
    >
      <Container className="flex-grow-1 py-4 px-4">
        <Row>
          <Col>
            {/* Header Section */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h1
                  className="mb-2 fw-bold"
                  style={{
                    color: "#0e1a13",
                    fontSize: "2.5rem",
                    textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  Admin Dashboard
                </h1>
                <p className="text-muted mb-0">
                  Manage your grocery store operations
                </p>
              </div>
              <Button
                variant="outline-primary"
                onClick={handleRefresh}
                disabled={refreshing}
                style={{
                  borderRadius: "12px",
                  padding: "10px 20px",
                  border: "2px solid #6366f1",
                  color: "#6366f1",
                  fontWeight: "600",
                }}
              >
                <FontAwesomeIcon
                  icon={faSync}
                  spin={refreshing}
                  className="me-2"
                />
                {refreshing ? "Refreshing..." : "Refresh"}
              </Button>
            </div>

            {/* Statistics Cards */}
            <Row className="mb-4 g-3">
              <Col lg={3} md={6}>
                <Card
                  className="text-center border-0 shadow-lg h-100"
                  style={{ borderRadius: "16px" }}
                >
                  <Card.Body className="p-4">
                    <div className="mb-3">
                      <FontAwesomeIcon
                        icon={faUsers}
                        size="2x"
                        className="text-primary"
                        style={{ color: "#6366f1 !important" }}
                      />
                    </div>
                    <h2
                      className="fw-bold mb-2"
                      style={{ color: "#6366f1", fontSize: "2.5rem" }}
                    >
                      {stats.totalUsers?.toLocaleString() || 0}
                    </h2>
                    <p className="text-muted mb-0 fw-semibold">Total Users</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={3} md={6}>
                <Card
                  className="text-center border-0 shadow-lg h-100"
                  style={{ borderRadius: "16px" }}
                >
                  <Card.Body className="p-4">
                    <div className="mb-3">
                      <FontAwesomeIcon
                        icon={faShoppingCart}
                        size="2x"
                        className="text-success"
                        style={{ color: "#10b981 !important" }}
                      />
                    </div>
                    <h2
                      className="fw-bold mb-2"
                      style={{ color: "#10b981", fontSize: "2.5rem" }}
                    >
                      {stats.totalOrders?.toLocaleString() || 0}
                    </h2>
                    <p className="text-muted mb-0 fw-semibold">Total Orders</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={3} md={6}>
                <Card
                  className="text-center border-0 shadow-lg h-100"
                  style={{ borderRadius: "16px" }}
                >
                  <Card.Body className="p-4">
                    <div className="mb-3">
                      <FontAwesomeIcon
                        icon={faBox}
                        size="2x"
                        className="text-info"
                        style={{ color: "#06b6d4 !important" }}
                      />
                    </div>
                    <h2
                      className="fw-bold mb-2"
                      style={{ color: "#06b6d4", fontSize: "2.5rem" }}
                    >
                      {stats.totalProducts?.toLocaleString() || 0}
                    </h2>
                    <p className="text-muted mb-0 fw-semibold">
                      Total Products
                    </p>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={3} md={6}>
                <Card
                  className="text-center border-0 shadow-lg h-100"
                  style={{ borderRadius: "16px" }}
                >
                  <Card.Body className="p-4">
                    <div className="mb-3">
                      <FontAwesomeIcon
                        icon={faDollarSign}
                        size="2x"
                        className="text-warning"
                        style={{ color: "#f59e0b !important" }}
                      />
                    </div>
                    <h2
                      className="fw-bold mb-2"
                      style={{ color: "#f59e0b", fontSize: "2.5rem" }}
                    >
                      ₨{(stats.totalRevenue || 0).toLocaleString()}
                      {/* Debug info */}
                      <small style={{ fontSize: "0.5rem", display: "block" }}>
                        Raw: {JSON.stringify(stats.totalRevenue)}
                      </small>
                    </h2>
                    <p className="text-muted mb-0 fw-semibold">Total Revenue</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Navigation Tabs */}
            <Card
              className="border-0 shadow-lg mb-4"
              style={{ borderRadius: "16px" }}
            >
              <Card.Body className="p-0">
                <Nav variant="tabs" className="border-0">
                  <Nav.Item>
                    <Nav.Link
                      active={activeTab === "overview"}
                      onClick={() => setActiveTab("overview")}
                      className="border-0 px-4 py-3"
                      style={{
                        color: activeTab === "overview" ? "#6366f1" : "#64748b",
                        fontWeight: activeTab === "overview" ? "600" : "500",
                        borderBottom:
                          activeTab === "overview"
                            ? "3px solid #6366f1"
                            : "none",
                        borderRadius: "0",
                      }}
                    >
                      <FontAwesomeIcon icon={faChartLine} className="me-2" />
                      Overview
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      active={activeTab === "products"}
                      onClick={() => setActiveTab("products")}
                      className="border-0 px-4 py-3"
                      style={{
                        color: activeTab === "products" ? "#6366f1" : "#64748b",
                        fontWeight: activeTab === "products" ? "600" : "500",
                        borderBottom:
                          activeTab === "products"
                            ? "3px solid #6366f1"
                            : "none",
                        borderRadius: "0",
                      }}
                    >
                      <FontAwesomeIcon icon={faBox} className="me-2" />
                      Products
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      active={activeTab === "orders"}
                      onClick={() => setActiveTab("orders")}
                      className="border-0 px-4 py-3"
                      style={{
                        color: activeTab === "orders" ? "#6366f1" : "#64748b",
                        fontWeight: activeTab === "orders" ? "600" : "500",
                        borderBottom:
                          activeTab === "orders" ? "3px solid #6366f1" : "none",
                        borderRadius: "0",
                      }}
                    >
                      <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                      Orders
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      active={activeTab === "users"}
                      onClick={() => setActiveTab("users")}
                      className="border-0 px-4 py-3"
                      style={{
                        color: activeTab === "users" ? "#6366f1" : "#64748b",
                        fontWeight: activeTab === "users" ? "600" : "500",
                        borderBottom:
                          activeTab === "users" ? "3px solid #6366f1" : "none",
                        borderRadius: "0",
                      }}
                    >
                      <FontAwesomeIcon icon={faUsers} className="me-2" />
                      Users
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      active={activeTab === "admins"}
                      onClick={() => setActiveTab("admins")}
                      className="border-0 px-4 py-3"
                      style={{
                        color: activeTab === "admins" ? "#6366f1" : "#64748b",
                        fontWeight: activeTab === "admins" ? "600" : "500",
                        borderBottom:
                          activeTab === "admins" ? "3px solid #6366f1" : "none",
                        borderRadius: "0",
                      }}
                    >
                      <FontAwesomeIcon icon={faUserShield} className="me-2" />
                      Admins
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Body>
            </Card>

            {/* Tab Content */}
            <Tab.Content>
              {activeTab === "overview" && (
                <Row className="g-4">
                  <Col lg={6}>
                    <Card
                      className="border-0 shadow-lg h-100"
                      style={{ borderRadius: "16px" }}
                    >
                      <Card.Header
                        className="border-0 bg-transparent"
                        style={{ padding: "1.5rem 1.5rem 0.5rem" }}
                      >
                        <h5
                          className="mb-0 fw-bold"
                          style={{ color: "#0e1a13" }}
                        >
                          <FontAwesomeIcon
                            icon={faShoppingCart}
                            className="me-2 text-primary"
                          />
                          Recent Orders
                        </h5>
                      </Card.Header>
                      <Card.Body style={{ padding: "1rem 1.5rem 1.5rem" }}>
                        {orders.slice(0, 5).map((order) => (
                          <div
                            key={order.id}
                            className="d-flex justify-content-between align-items-center mb-3 p-3"
                            style={{
                              background: "#f8f9fa",
                              borderRadius: "12px",
                              border: "1px solid #e9ecef",
                            }}
                          >
                            <div>
                              <strong
                                className="d-block"
                                style={{ color: "#0e1a13" }}
                              >
                                Order #{order.id}
                              </strong>
                              <small className="text-muted">
                                {order.user?.email}
                              </small>
                            </div>
                            {getOrderStatusBadge(order.status)}
                          </div>
                        ))}
                        {orders.length === 0 && (
                          <div className="text-center text-muted py-4">
                            <FontAwesomeIcon
                              icon={faShoppingCart}
                              size="2x"
                              className="mb-3"
                            />
                            <p>No orders yet</p>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col lg={6}>
                    <Card
                      className="border-0 shadow-lg h-100"
                      style={{ borderRadius: "16px" }}
                    >
                      <Card.Header
                        className="border-0 bg-transparent"
                        style={{ padding: "1.5rem 1.5rem 0.5rem" }}
                      >
                        <h5
                          className="mb-0 fw-bold"
                          style={{ color: "#0e1a13" }}
                        >
                          <FontAwesomeIcon
                            icon={faUsers}
                            className="me-2 text-primary"
                          />
                          Recent Users
                        </h5>
                      </Card.Header>
                      <Card.Body style={{ padding: "1rem 1.5rem 1.5rem" }}>
                        {users.slice(0, 5).map((user) => (
                          <div
                            key={user.id}
                            className="d-flex justify-content-between align-items-center mb-3 p-3"
                            style={{
                              background: "#f8f9fa",
                              borderRadius: "12px",
                              border: "1px solid #e9ecef",
                            }}
                          >
                            <div>
                              <strong
                                className="d-block"
                                style={{ color: "#0e1a13" }}
                              >
                                {user.firstName} {user.lastName}
                              </strong>
                              <small className="text-muted">{user.email}</small>
                            </div>
                            <Badge
                              bg={user.active ? "success" : "danger"}
                              style={{
                                borderRadius: "8px",
                                padding: "8px 12px",
                              }}
                            >
                              {user.active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        ))}
                        {users.length === 0 && (
                          <div className="text-center text-muted py-4">
                            <FontAwesomeIcon
                              icon={faUsers}
                              size="2x"
                              className="mb-3"
                            />
                            <p>No users yet</p>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              )}

              {activeTab === "products" && (
                <Card
                  className="border-0 shadow-lg"
                  style={{ borderRadius: "16px" }}
                >
                  <Card.Header
                    className="border-0 bg-transparent"
                    style={{ padding: "1.5rem 1.5rem 0.5rem" }}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="mb-0 fw-bold" style={{ color: "#0e1a13" }}>
                        <FontAwesomeIcon
                          icon={faBox}
                          className="me-2 text-primary"
                        />
                        Product Management
                      </h5>
                      <Button
                        variant="primary"
                        onClick={() => setShowProductModal(true)}
                        style={{
                          background: "#6366f1",
                          border: "none",
                          borderRadius: "12px",
                          padding: "10px 20px",
                          fontWeight: "600",
                        }}
                      >
                        <FontAwesomeIcon icon={faPlus} className="me-2" />
                        Add Product
                      </Button>
                    </div>
                  </Card.Header>
                  <Card.Body style={{ padding: "1rem 1.5rem 1.5rem" }}>
                    <div className="table-responsive">
                      <Table className="mb-0">
                        <thead>
                          <tr style={{ background: "#f8f9fa" }}>
                            <th className="border-0 py-3">ID</th>
                            <th className="border-0 py-3">Name</th>
                            <th className="border-0 py-3">Category</th>
                            <th className="border-0 py-3">Price</th>
                            <th className="border-0 py-3">Stock</th>
                            <th className="border-0 py-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((product) => (
                            <tr
                              key={product.id}
                              style={{ borderBottom: "1px solid #e9ecef" }}
                            >
                              <td className="py-3">{product.id}</td>
                              <td className="py-3">
                                <div className="d-flex align-items-center">
                                  <img
                                    src={
                                      product.images &&
                                      product.images.length > 0
                                        ? product.images[0].url
                                        : "/placeholder-product.jpg"
                                    }
                                    alt={
                                      product.images &&
                                      product.images.length > 0
                                        ? product.images[0].altText ||
                                          product.name
                                        : product.name
                                    }
                                    style={{
                                      width: "40px",
                                      height: "40px",
                                      objectFit: "cover",
                                      borderRadius: "8px",
                                      marginRight: "12px",
                                    }}
                                    onError={(e) => {
                                      e.target.src = "/placeholder-product.jpg";
                                    }}
                                  />
                                  <div>
                                    <strong
                                      className="d-block"
                                      style={{ color: "#0e1a13" }}
                                    >
                                      {product.name}
                                    </strong>
                                    {product.description && (
                                      <div className="text-muted small">
                                        {product.description.substring(0, 50)}
                                        {product.description.length > 50 &&
                                          "..."}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="py-3">
                                <Badge
                                  bg="info"
                                  style={{ borderRadius: "8px" }}
                                >
                                  {product.category?.name || "N/A"}
                                </Badge>
                              </td>
                              <td
                                className="py-3 fw-bold"
                                style={{ color: "#10b981" }}
                              >
                                ₨{product.price?.toLocaleString()}
                              </td>
                              <td className="py-3">
                                <Badge
                                  bg={
                                    product.stock > 10 ? "success" : "warning"
                                  }
                                  style={{ borderRadius: "8px" }}
                                >
                                  {product.stock}
                                </Badge>
                              </td>
                              <td className="py-3">
                                <ButtonGroup size="sm">
                                  <Button
                                    variant="outline-primary"
                                    onClick={() => {
                                      setSelectedProduct(product);
                                      setShowProductModal(true);
                                    }}
                                    style={{ borderRadius: "8px 0 0 8px" }}
                                  >
                                    <FontAwesomeIcon icon={faEdit} />
                                  </Button>
                                  <Button
                                    variant="outline-danger"
                                    onClick={() =>
                                      handleDeleteProduct(product.id)
                                    }
                                    style={{ borderRadius: "0 8px 8px 0" }}
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                  </Button>
                                </ButtonGroup>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                    {products.length === 0 && (
                      <div className="text-center text-muted py-5">
                        <FontAwesomeIcon
                          icon={faBox}
                          size="3x"
                          className="mb-3"
                        />
                        <h5>No products found</h5>
                        <p>Start by adding your first product</p>
                        <Button
                          variant="primary"
                          onClick={() => setShowProductModal(true)}
                          style={{
                            background: "#6366f1",
                            border: "none",
                            borderRadius: "12px",
                          }}
                        >
                          <FontAwesomeIcon icon={faPlus} className="me-2" />
                          Add Product
                        </Button>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              )}

              {activeTab === "orders" && (
                <Card
                  className="border-0 shadow-lg"
                  style={{ borderRadius: "16px" }}
                >
                  <Card.Header
                    className="border-0 bg-transparent"
                    style={{ padding: "1.5rem 1.5rem 0.5rem" }}
                  >
                    <h5 className="mb-0 fw-bold" style={{ color: "#0e1a13" }}>
                      <FontAwesomeIcon
                        icon={faShoppingCart}
                        className="me-2 text-primary"
                      />
                      Order Management
                    </h5>
                  </Card.Header>
                  <Card.Body style={{ padding: "1rem 1.5rem 1.5rem" }}>
                    <div className="table-responsive">
                      <Table className="mb-0">
                        <thead>
                          <tr style={{ background: "#f8f9fa" }}>
                            <th className="border-0 py-3">Order ID</th>
                            <th className="border-0 py-3">Customer</th>
                            <th className="border-0 py-3">Total</th>
                            <th className="border-0 py-3">Status</th>
                            <th className="border-0 py-3">Date</th>
                            <th className="border-0 py-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((order) => (
                            <tr
                              key={order.id}
                              style={{ borderBottom: "1px solid #e9ecef" }}
                            >
                              <td className="py-3">
                                <strong style={{ color: "#6366f1" }}>
                                  #{order.id}
                                </strong>
                              </td>
                              <td className="py-3">{order.user?.email}</td>
                              <td
                                className="py-3 fw-bold"
                                style={{ color: "#10b981" }}
                              >
                                ₨{order.totalAmount?.toLocaleString()}
                              </td>
                              <td className="py-3">
                                {getOrderStatusBadge(order.status)}
                              </td>
                              <td className="py-3">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </td>
                              <td className="py-3">
                                <Dropdown>
                                  <Dropdown.Toggle
                                    size="sm"
                                    variant="outline-secondary"
                                    style={{ borderRadius: "8px" }}
                                  >
                                    Actions
                                  </Dropdown.Toggle>
                                  <Dropdown.Menu>
                                    <Dropdown.Item
                                      onClick={() =>
                                        handleOrderStatusUpdate(
                                          order.id,
                                          "PENDING"
                                        )
                                      }
                                    >
                                      Mark Pending
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                      onClick={() =>
                                        handleOrderStatusUpdate(
                                          order.id,
                                          "PROCESSING"
                                        )
                                      }
                                    >
                                      Mark Processing
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                      onClick={() =>
                                        handleOrderStatusUpdate(
                                          order.id,
                                          "COMPLETED"
                                        )
                                      }
                                    >
                                      Mark Completed
                                    </Dropdown.Item>
                                  </Dropdown.Menu>
                                </Dropdown>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                    {orders.length === 0 && (
                      <div className="text-center text-muted py-5">
                        <FontAwesomeIcon
                          icon={faShoppingCart}
                          size="3x"
                          className="mb-3"
                        />
                        <h5>No orders found</h5>
                        <p>
                          Orders will appear here when customers make purchases
                        </p>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              )}

              {activeTab === "users" && (
                <Card
                  className="border-0 shadow-lg"
                  style={{ borderRadius: "16px" }}
                >
                  <Card.Header
                    className="border-0 bg-transparent"
                    style={{ padding: "1.5rem 1.5rem 0.5rem" }}
                  >
                    <h5 className="mb-0 fw-bold" style={{ color: "#0e1a13" }}>
                      <FontAwesomeIcon
                        icon={faUsers}
                        className="me-2 text-primary"
                      />
                      User Management
                    </h5>
                  </Card.Header>
                  <Card.Body style={{ padding: "1rem 1.5rem 1.5rem" }}>
                    <div className="table-responsive">
                      <Table className="mb-0">
                        <thead>
                          <tr style={{ background: "#f8f9fa" }}>
                            <th className="border-0 py-3">ID</th>
                            <th className="border-0 py-3">Name</th>
                            <th className="border-0 py-3">Email</th>
                            <th className="border-0 py-3">Role</th>
                            <th className="border-0 py-3">Status</th>
                            <th className="border-0 py-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users
                            .filter((user) =>
                              user.roles?.some(
                                (role) => role.name === "ROLE_USER"
                              )
                            )
                            .map((user) => (
                              <tr
                                key={user.id}
                                style={{ borderBottom: "1px solid #e9ecef" }}
                              >
                                <td className="py-3">{user.id}</td>
                                <td className="py-3">
                                  <strong style={{ color: "#0e1a13" }}>
                                    {user.firstName} {user.lastName}
                                  </strong>
                                </td>
                                <td className="py-3">{user.email}</td>
                                <td className="py-3">
                                  <Badge
                                    bg="info"
                                    style={{ borderRadius: "8px" }}
                                  >
                                    {user.roles
                                      ?.map((role) =>
                                        role.name.replace("ROLE_", "")
                                      )
                                      .join(", ")}
                                  </Badge>
                                </td>
                                <td className="py-3">
                                  <Badge
                                    bg={user.active ? "success" : "danger"}
                                    style={{ borderRadius: "8px" }}
                                  >
                                    {user.active ? "Active" : "Inactive"}
                                  </Badge>
                                </td>
                                <td className="py-3">
                                  <Button
                                    size="sm"
                                    variant={
                                      user.active
                                        ? "outline-danger"
                                        : "outline-success"
                                    }
                                    onClick={() =>
                                      handleUserStatusToggle(
                                        user.id,
                                        !user.active,
                                        `${user.firstName} ${user.lastName}`
                                      )
                                    }
                                    style={{ borderRadius: "8px" }}
                                  >
                                    <FontAwesomeIcon
                                      icon={
                                        user.active ? faUserTimes : faUserCheck
                                      }
                                      className="me-1"
                                    />
                                    {user.active ? "Deactivate" : "Activate"}
                                  </Button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </Table>
                    </div>
                    {users.filter((user) =>
                      user.roles?.some((role) => role.name === "ROLE_USER")
                    ).length === 0 && (
                      <div className="text-center text-muted py-5">
                        <FontAwesomeIcon
                          icon={faUsers}
                          size="3x"
                          className="mb-3"
                        />
                        <h5>No regular users found</h5>
                        <p>Regular users will appear here when they register</p>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              )}

              {activeTab === "admins" && (
                <Card
                  className="border-0 shadow-lg"
                  style={{ borderRadius: "16px" }}
                >
                  <Card.Header
                    className="border-0 bg-transparent"
                    style={{ padding: "1.5rem 1.5rem 0.5rem" }}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="mb-0 fw-bold" style={{ color: "#0e1a13" }}>
                        <FontAwesomeIcon
                          icon={faUserShield}
                          className="me-2 text-primary"
                        />
                        Admin Management
                      </h5>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setShowAdminModal(true)}
                        style={{
                          background: "#6366f1",
                          border: "none",
                          borderRadius: "12px",
                          padding: "10px 20px",
                          fontWeight: "600",
                        }}
                      >
                        <FontAwesomeIcon icon={faPlus} className="me-2" />
                        Create New Admin
                      </Button>
                    </div>
                  </Card.Header>
                  <Card.Body style={{ padding: "1rem 1.5rem 1.5rem" }}>
                    <div className="table-responsive">
                      <Table className="mb-0">
                        <thead>
                          <tr style={{ background: "#f8f9fa" }}>
                            <th className="border-0 py-3">ID</th>
                            <th className="border-0 py-3">Name</th>
                            <th className="border-0 py-3">Email</th>
                            <th className="border-0 py-3">Phone</th>
                            <th className="border-0 py-3">Status</th>
                            <th className="border-0 py-3">Created</th>
                            <th className="border-0 py-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users
                            .filter(
                              (user) =>
                                user.roles?.some(
                                  (role) => role.name === "ROLE_ADMIN"
                                ) && user.email !== "admin@grocerystore.com"
                            )
                            .map((admin) => (
                              <tr
                                key={admin.id}
                                style={{ borderBottom: "1px solid #e9ecef" }}
                              >
                                <td className="py-3">{admin.id}</td>
                                <td className="py-3">
                                  <strong style={{ color: "#0e1a13" }}>
                                    {admin.firstName} {admin.lastName}
                                  </strong>
                                </td>
                                <td className="py-3">{admin.email}</td>
                                <td className="py-3">{admin.phone || "N/A"}</td>
                                <td className="py-3">
                                  <Badge
                                    bg={admin.active ? "success" : "danger"}
                                    style={{ borderRadius: "8px" }}
                                  >
                                    {admin.active ? "Active" : "Inactive"}
                                  </Badge>
                                </td>
                                <td className="py-3">
                                  {admin.createdAt
                                    ? new Date(
                                        admin.createdAt
                                      ).toLocaleDateString()
                                    : "N/A"}
                                </td>
                                <td className="py-3">
                                  <Button
                                    size="sm"
                                    variant={
                                      admin.active
                                        ? "outline-danger"
                                        : "outline-success"
                                    }
                                    onClick={() =>
                                      handleAdminStatusToggle(
                                        admin.id,
                                        !admin.active,
                                        `${admin.firstName} ${admin.lastName}`
                                      )
                                    }
                                    style={{ borderRadius: "8px" }}
                                  >
                                    <FontAwesomeIcon
                                      icon={
                                        admin.active ? faUserTimes : faUserCheck
                                      }
                                      className="me-1"
                                    />
                                    {admin.active ? "Deactivate" : "Activate"}
                                  </Button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </Table>
                    </div>
                    {users.filter(
                      (user) =>
                        user.roles?.some(
                          (role) => role.name === "ROLE_ADMIN"
                        ) && user.email !== "admin@grocerystore.com"
                    ).length === 0 && (
                      <div className="text-center text-muted py-5">
                        <FontAwesomeIcon
                          icon={faUserShield}
                          size="3x"
                          className="mb-3"
                        />
                        <h5>No additional admin users found</h5>
                        <p>
                          Create additional admin users to help manage the
                          system
                        </p>
                        <Button
                          variant="primary"
                          onClick={() => setShowAdminModal(true)}
                          style={{
                            background: "#6366f1",
                            border: "none",
                            borderRadius: "12px",
                          }}
                        >
                          <FontAwesomeIcon icon={faPlus} className="me-2" />
                          Create Admin
                        </Button>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              )}
            </Tab.Content>
          </Col>
        </Row>
      </Container>

      {/* Product Modal */}
      <ProductModal
        show={showProductModal}
        onHide={() => {
          setShowProductModal(false);
          setSelectedProduct(null);
        }}
        onSubmit={handleProductSubmit}
        product={selectedProduct}
      />

      {/* Order Modal */}
      <OrderModal
        show={showOrderModal}
        onHide={() => {
          setShowOrderModal(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
      />

      {/* Admin Creation Modal */}
      <Modal show={showAdminModal} onHide={() => setShowAdminModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Admin</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAdminCreation}>
            <Form.Group className="mb-3">
              <Form.Label>Email *</Form.Label>
              <Form.Control
                type="email"
                value={adminFormData.email}
                onChange={(e) =>
                  setAdminFormData({ ...adminFormData, email: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password *</Form.Label>
              <Form.Control
                type="password"
                value={adminFormData.password}
                onChange={(e) =>
                  setAdminFormData({
                    ...adminFormData,
                    password: e.target.value,
                  })
                }
                required
                minLength={6}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>First Name *</Form.Label>
              <Form.Control
                type="text"
                value={adminFormData.firstName}
                onChange={(e) =>
                  setAdminFormData({
                    ...adminFormData,
                    firstName: e.target.value,
                  })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Last Name *</Form.Label>
              <Form.Control
                type="text"
                value={adminFormData.lastName}
                onChange={(e) =>
                  setAdminFormData({
                    ...adminFormData,
                    lastName: e.target.value,
                  })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="tel"
                value={adminFormData.phone}
                onChange={(e) =>
                  setAdminFormData({ ...adminFormData, phone: e.target.value })
                }
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowAdminModal(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Create Admin
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Toast Container for Notifications */}
      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        limit={3}
        theme="colored"
      />
    </div>
  );
};

// Product Modal Component
const ProductModal = ({ show, onHide, onSubmit, product }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
    imageUrl: "",
    imageAltText: "",
  });
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    if (product) {
      // Get the first image URL if available
      const firstImageUrl =
        product.images && product.images.length > 0
          ? product.images[0].url
          : "";

      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        stock: product.stock || "",
        categoryId: product.category?.id || "",
        imageUrl: firstImageUrl,
        imageAltText:
          product.images && product.images.length > 0
            ? product.images[0].altText || product.name
            : "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        stock: "",
        categoryId: "",
        imageUrl: "",
        imageAltText: "",
      });
    }
  }, [product]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);

    // Clear form if it's a new product (not editing)
    if (!product) {
      setFormData({
        name: "",
        description: "",
        price: "",
        stock: "",
        categoryId: "",
        imageUrl: "",
        imageAltText: "",
      });
    }
  };

  const handleImageUpload = async (file) => {
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setImageUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/api/admin/upload-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setFormData((prev) => ({ ...prev, imageUrl: response.data.url }));
      toast.success("Image uploaded successfully!", { autoClose: 4000 });
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload image", {
        autoClose: 8000,
      });
    } finally {
      setImageUploading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{product ? "Edit Product" : "Add Product"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Product Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Price</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />
          </Form.Group>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Stock Quantity</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                  }
                  required
                >
                  <option value="">Select Category</option>
                  <option value="1">Fruits</option>
                  <option value="2">Vegetables</option>
                  <option value="3">Dairy</option>
                  <option value="4">Bakery</option>
                  <option value="5">Meat</option>
                  <option value="6">Seafood</option>
                  <option value="7">Beverages</option>
                  <option value="8">Snacks</option>
                  <option value="9">Frozen Foods</option>
                  <option value="10">Pantry</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Product Image</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  disabled={imageUploading}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      // Handle file upload
                      handleImageUpload(file);
                    }
                  }}
                />
                <Form.Text className="text-muted">
                  {imageUploading ? (
                    <span className="text-primary">
                      <Spinner animation="border" size="sm" className="me-2" />
                      Uploading image...
                    </span>
                  ) : (
                    "Upload a product image (JPG, PNG, GIF, WebP, max 5MB)"
                  )}
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Image Alt Text</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Product image description"
                  value={formData.imageAltText}
                  onChange={(e) =>
                    setFormData({ ...formData, imageAltText: e.target.value })
                  }
                />
                <Form.Text className="text-muted">
                  Optional: Description for accessibility
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          {/* Image Preview */}
          {formData.imageUrl && (
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Image Preview</Form.Label>
                  <div className="text-center">
                    <img
                      src={formData.imageUrl}
                      alt={formData.imageAltText || "Product preview"}
                      className="img-fluid rounded"
                      style={{
                        maxWidth: "200px",
                        maxHeight: "200px",
                        objectFit: "cover",
                        border: "1px solid #dee2e6",
                        background: "#f8f9fa",
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "block";
                      }}
                    />
                    <div
                      className="text-muted mt-2"
                      style={{ display: "none" }}
                    >
                      Image failed to load. Please check the URL.
                    </div>
                    <div className="mt-2">
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            imageUrl: "",
                            imageAltText: "",
                          });
                        }}
                      >
                        Remove Image
                      </Button>
                    </div>
                  </div>
                </Form.Group>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            style={{ background: "#6366f1", border: "none" }}
          >
            {product ? "Update" : "Create"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

// Order Modal Component
const OrderModal = ({ show, onHide, order }) => {
  if (!order) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Order Details #{order.id}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col md={6}>
            <h6>Customer Information</h6>
            <p>
              <strong>Name:</strong> {order.user?.firstName}{" "}
              {order.user?.lastName}
            </p>
            <p>
              <strong>Email:</strong> {order.user?.email}
            </p>
            <p>
              <strong>Phone:</strong> {order.user?.phone}
            </p>
          </Col>
          <Col md={6}>
            <h6>Order Information</h6>
            <p>
              <strong>Order ID:</strong> #{order.id}
            </p>
            <p>
              <strong>Status:</strong> {getOrderStatusBadge(order.status)}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
            <p>
              <strong>Total:</strong> ₨{order.totalAmount?.toLocaleString()}
            </p>
          </Col>
        </Row>
        <hr />
        <h6>Order Items</h6>
        <Table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.orderItems?.map((item) => (
              <tr key={item.id}>
                <td>{item.product?.name}</td>
                <td>{item.quantity}</td>
                <td>₨{item.price?.toLocaleString()}</td>
                <td>₨{(item.price * item.quantity)?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AdminDashboard;
