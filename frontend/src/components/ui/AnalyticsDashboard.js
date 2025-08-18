import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Badge,
  Table,
  ProgressBar,
  Button,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faShoppingCart,
  faDollarSign,
  faChartLine,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import api from "../../utils/axios";

const AnalyticsDashboard = () => {
  const [dashboardStats, setDashboardStats] = useState({});
  const [salesAnalytics, setSalesAnalytics] = useState({});
  const [productAnalytics, setProductAnalytics] = useState({});
  const [userAnalytics, setUserAnalytics] = useState({});
  const [revenueAnalytics, setRevenueAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [stats, sales, products, users, revenue] = await Promise.all([
        api.get("/api/analytics/dashboard-stats"),
        api.get(`/api/analytics/sales?period=${selectedPeriod}`),
        api.get("/api/analytics/products"),
        api.get("/api/analytics/users"),
        api.get("/api/analytics/revenue"),
      ]);

      setDashboardStats(stats.data);
      setSalesAnalytics(sales.data);
      setProductAnalytics(products.data);
      setUserAnalytics(users.data);
      setRevenueAnalytics(revenue.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    try {
      const response = await api.get("/api/analytics/export");
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `analytics-report-${
        new Date().toISOString().split("T")[0]
      }.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting report:", error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Analytics Dashboard</h2>
        <div className="d-flex gap-2">
          <select
            className="form-select"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            style={{ width: "auto" }}
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
          <Button variant="outline-primary" onClick={exportReport}>
            <FontAwesomeIcon icon={faDownload} className="me-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <FontAwesomeIcon
                icon={faUsers}
                size="2x"
                className="text-primary mb-2"
              />
              <h4>{formatNumber(dashboardStats.totalUsers || 0)}</h4>
              <p className="text-muted mb-0">Total Users</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <FontAwesomeIcon
                icon={faShoppingCart}
                size="2x"
                className="text-success mb-2"
              />
              <h4>{formatNumber(dashboardStats.totalOrders || 0)}</h4>
              <p className="text-muted mb-0">Total Orders</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <FontAwesomeIcon
                icon={faDollarSign}
                size="2x"
                className="text-warning mb-2"
              />
              <h4>{formatCurrency(dashboardStats.totalRevenue || 0)}</h4>
              <p className="text-muted mb-0">Total Revenue</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <FontAwesomeIcon
                icon={faChartLine}
                size="2x"
                className="text-info mb-2"
              />
              <h4>{formatCurrency(dashboardStats.averageOrderValue || 0)}</h4>
              <p className="text-muted mb-0">Avg Order Value</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Sales Analytics */}
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Sales Overview</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Total Sales ({selectedPeriod})</span>
                  <strong>
                    {formatCurrency(salesAnalytics.totalSales || 0)}
                  </strong>
                </div>
                <ProgressBar now={100} variant="success" className="mt-1" />
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Order Count</span>
                  <strong>
                    {formatNumber(salesAnalytics.orderCount || 0)}
                  </strong>
                </div>
                <ProgressBar now={100} variant="info" className="mt-1" />
              </div>
              <div>
                <div className="d-flex justify-content-between">
                  <span>Average Order Value</span>
                  <strong>
                    {formatCurrency(salesAnalytics.averageOrderValue || 0)}
                  </strong>
                </div>
                <ProgressBar now={100} variant="warning" className="mt-1" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">User Analytics</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Active Users</span>
                  <strong>
                    {formatNumber(userAnalytics.activeUsers || 0)}
                  </strong>
                </div>
                <ProgressBar
                  now={
                    userAnalytics.userActivityRate
                      ? userAnalytics.userActivityRate * 100
                      : 0
                  }
                  variant="primary"
                  className="mt-1"
                />
                <small className="text-muted">
                  {((userAnalytics.userActivityRate || 0) * 100).toFixed(1)}% of
                  total users
                </small>
              </div>
              <div>
                <div className="d-flex justify-content-between">
                  <span>Total Users</span>
                  <strong>{formatNumber(userAnalytics.totalUsers || 0)}</strong>
                </div>
                <ProgressBar now={100} variant="secondary" className="mt-1" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Top Products */}
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Top Selling Products</h5>
            </Card.Header>
            <Card.Body>
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Sales</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {(productAnalytics.topSellingProducts || []).map(
                    (product, index) => (
                      <tr key={product.id}>
                        <td>
                          <div>
                            <strong>{product.name}</strong>
                            <br />
                            <small className="text-muted">
                              {formatCurrency(product.price)}
                            </small>
                          </div>
                        </td>
                        <td>
                          <Badge bg="success">{product.salesQuantity}</Badge>
                        </td>
                        <td>
                          <Badge
                            bg={product.stock > 10 ? "success" : "warning"}
                          >
                            {product.stock}
                          </Badge>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Low Stock Products</h5>
            </Card.Header>
            <Card.Body>
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Stock</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {(productAnalytics.lowStockProducts || []).map(
                    (product, index) => (
                      <tr key={product.id}>
                        <td>
                          <div>
                            <strong>{product.name}</strong>
                          </div>
                        </td>
                        <td>
                          <Badge bg="danger">{product.stock}</Badge>
                        </td>
                        <td>{formatCurrency(product.price)}</td>
                      </tr>
                    )
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Revenue Analytics */}
      <Row className="mb-4">
        <Col md={12}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Revenue Analytics</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <div className="text-center">
                    <h3 className="text-success">
                      {revenueAnalytics.revenueGrowthRate
                        ? `${
                            revenueAnalytics.revenueGrowthRate > 0 ? "+" : ""
                          }${revenueAnalytics.revenueGrowthRate.toFixed(1)}%`
                        : "0%"}
                    </h3>
                    <p className="text-muted">Revenue Growth Rate</p>
                  </div>
                </Col>
                <Col md={8}>
                  <div>
                    <h6>Revenue by Month</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {Object.entries(
                        revenueAnalytics.revenueByMonth || {}
                      ).map(([month, revenue]) => (
                        <Badge
                          key={month}
                          bg="light"
                          text="dark"
                          className="p-2"
                        >
                          {month}: {formatCurrency(revenue)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Order Status Breakdown */}
      <Row className="mb-4">
        <Col md={12}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Order Status Breakdown</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                {Object.entries(dashboardStats.orderStatusBreakdown || {}).map(
                  ([status, count]) => (
                    <Col md={3} key={status} className="mb-3">
                      <div className="text-center">
                        <h4 className={`text-${getStatusColor(status)}`}>
                          {formatNumber(count)}
                        </h4>
                        <p className="text-muted mb-0 text-capitalize">
                          {status.replace("_", " ")}
                        </p>
                      </div>
                    </Col>
                  )
                )}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "warning";
    case "processing":
      return "info";
    case "shipped":
      return "primary";
    case "delivered":
      return "success";
    case "cancelled":
      return "danger";
    default:
      return "secondary";
  }
};

export default AnalyticsDashboard;
