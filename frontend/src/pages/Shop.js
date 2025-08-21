import React, { useState, useEffect, useContext, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Badge,
  Spinner,
  Alert,
  InputGroup,
  Dropdown,
  Modal,
} from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilter,
  faSort,
  faTimes,
  faShoppingCart,
  faSearch,
  faHeart,
  faEye,
  faStar,
  faChevronLeft,
  faChevronRight,
  faTh,
  faList,
  faSlidersH,
  faTags,
  faDollarSign,
  faClock,
  faFire,
  faCheckCircle,
  faExclamationTriangle,
  faLeaf,
  faTruck,
  faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart as farHeart } from "@fortawesome/free-regular-svg-icons";
import axios from "axios";
import { CartContext } from "../context/CartContext";

const Shop = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);

  // State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [wishlist, setWishlist] = useState(new Set());
  const [filters, setFilters] = useState({
    page: parseInt(queryParams.get("page")) || 0,
    size: parseInt(queryParams.get("size")) || 12,
    sort: queryParams.get("sort") || "name",
    direction: queryParams.get("direction") || "asc",
    categoryId: queryParams.get("categoryId") || "",
    search: queryParams.get("search") || "",
    minPrice: queryParams.get("minPrice") || "",
    maxPrice: queryParams.get("maxPrice") || "",
    inStock: queryParams.get("inStock") === "true",
    onSale: queryParams.get("onSale") === "true",
  });

  // Memoized filtered products count
  const filteredCount = useMemo(() => {
    return products.length;
  }, [products]);

  // Fetch products based on filters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Build query string from filters
        let queryString = `?page=${filters.page}&size=${filters.size}&sort=${filters.sort}&direction=${filters.direction}`;

        if (filters.categoryId) {
          queryString += `&categoryId=${filters.categoryId}`;
        }

        if (filters.search) {
          queryString += `&search=${encodeURIComponent(filters.search)}`;
        }

        if (filters.minPrice) {
          queryString += `&minPrice=${filters.minPrice}`;
        }

        if (filters.maxPrice) {
          queryString += `&maxPrice=${filters.maxPrice}`;
        }

        if (filters.inStock) {
          queryString += `&inStock=true`;
        }

        const response = await axios.get(`/api/products${queryString}`);
        setProducts(response.data.content);
        setTotalPages(response.data.totalPages);
        setTotalElements(response.data.totalElements);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/api/categories");
        // Remove duplicates based on id and name
        const uniqueCategories = response.data.filter(
          (category, index, self) =>
            index ===
            self.findIndex(
              (c) => c.id === category.id && c.name === category.name
            )
        );
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.page > 0) params.append("page", filters.page);
    if (filters.size !== 12) params.append("size", filters.size);
    if (filters.sort !== "name") params.append("sort", filters.sort);
    if (filters.direction !== "asc")
      params.append("direction", filters.direction);
    if (filters.categoryId) params.append("categoryId", filters.categoryId);
    if (filters.search) params.append("search", filters.search);
    if (filters.minPrice) params.append("minPrice", filters.minPrice);
    if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
    if (filters.inStock) params.append("inStock", filters.inStock);
    if (filters.onSale) params.append("onSale", filters.onSale);

    navigate(`/shop?${params.toString()}`, { replace: true });
  }, [filters, navigate]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      page: 0, // Reset to first page when filters change
    }));
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      page: 0,
      size: 12,
      sort: "name",
      direction: "asc",
      categoryId: "",
      search: "",
      minPrice: "",
      maxPrice: "",
      inStock: false,
      onSale: false,
    });
  };

  // Toggle wishlist
  const toggleWishlist = (productId) => {
    setWishlist((prev) => {
      const newWishlist = new Set(prev);
      if (newWishlist.has(productId)) {
        newWishlist.delete(productId);
      } else {
        newWishlist.add(productId);
      }
      return newWishlist;
    });
  };

  // Generate pagination items
  const generatePaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(
      0,
      Math.min(
        filters.page - Math.floor(maxVisiblePages / 2),
        totalPages - maxVisiblePages
      )
    );
    const endPage = Math.min(startPage + maxVisiblePages, totalPages);

    // First page
    if (startPage > 0) {
      items.push(
        <Button
          key="first"
          variant="outline-primary"
          size="sm"
          onClick={() => handlePageChange(0)}
          className="me-1"
        >
          1
        </Button>
      );
      if (startPage > 1) {
        items.push(
          <span key="ellipsis1" className="mx-2 text-muted">
            ...
          </span>
        );
      }
    }

    // Visible pages
    for (let i = startPage; i < endPage; i++) {
      items.push(
        <Button
          key={i}
          variant={i === filters.page ? "primary" : "outline-primary"}
          size="sm"
          onClick={() => handlePageChange(i)}
          className="me-1"
        >
          {i + 1}
        </Button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <span key="ellipsis2" className="mx-2 text-muted">
            ...
          </span>
        );
      }
      items.push(
        <Button
          key="last"
          variant="outline-primary"
          size="sm"
          onClick={() => handlePageChange(totalPages - 1)}
          className="ms-1"
        >
          {totalPages}
        </Button>
      );
    }

    return items;
  };

  // Sort options
  const sortOptions = [
    { value: "name", label: "Name A-Z", icon: faSort },
    { value: "name,desc", label: "Name Z-A", icon: faSort },
    { value: "price", label: "Price Low to High", icon: faDollarSign },
    { value: "price,desc", label: "Price High to Low", icon: faDollarSign },
    { value: "createdAt", label: "Newest First", icon: faClock },
    { value: "createdAt,desc", label: "Oldest First", icon: faClock },
  ];

  const handleSortChange = (sortValue) => {
    const [field, direction] = sortValue.includes(",")
      ? sortValue.split(",")
      : [sortValue, "asc"];
    setFilters((prev) => ({
      ...prev,
      sort: field,
      direction: direction || "asc",
      page: 0,
    }));
  };

  return (
    <div className="shop-page">
      {/* Hero Section */}
      <div className="shop-hero">
        <Container>
          <div className="hero-content text-center">
            <h1 className="hero-title">Fresh & Organic</h1>
            <p className="hero-subtitle">
              Discover Fresh Products Delivered to You
            </p>
            <p className="hero-description">
              Explore our curated collection of premium groceries and household
              essentials
            </p>

            {/* Search Bar */}
            <div className="search-container">
              <InputGroup className="search-input-group">
                <InputGroup.Text className="search-icon">
                  <FontAwesomeIcon icon={faSearch} />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search for products, categories, or brands..."
                  className="search-input"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      // Trigger search
                      setFilters((prev) => ({ ...prev, page: 0 }));
                    }
                  }}
                  list="category-suggestions"
                />
                <datalist id="category-suggestions">
                  {categories.map((category) => (
                    <option key={category.id} value={category.name} />
                  ))}
                </datalist>
                <Button
                  variant="primary"
                  className="search-btn"
                  onClick={() => {
                    // Trigger search
                    setFilters((prev) => ({ ...prev, page: 0 }));
                  }}
                >
                  <FontAwesomeIcon icon={faSearch} />
                </Button>
              </InputGroup>
            </div>

            {/* Quick Stats */}
            <div className="quick-stats">
              <div className="stat-item">
                <span className="stat-number">{totalElements}</span>
                <span className="stat-label">Products</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{filteredCount}</span>
                <span className="stat-label">Showing</span>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <Container className="shop-content">
        {/* Filters and Controls */}
        <div className="shop-controls">
          <div className="controls-header mb-3">
            <h5 className="controls-title mb-0">
              <FontAwesomeIcon icon={faFilter} className="me-2" />
              Shop Controls
            </h5>
            <p className="controls-subtitle mb-0">
              Filter and sort products to find exactly what you need
            </p>
          </div>

          <Row className="align-items-center">
            <Col lg={6}>
              <div className="d-flex align-items-center gap-3">
                <div className="view-mode-toggle">
                  <Button
                    variant={
                      viewMode === "grid" ? "primary" : "outline-primary"
                    }
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="me-1"
                  >
                    <FontAwesomeIcon icon={faTh} />
                  </Button>
                  <Button
                    variant={
                      viewMode === "list" ? "primary" : "outline-primary"
                    }
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <FontAwesomeIcon icon={faList} />
                  </Button>
                </div>

                <div className="active-filters">
                  {filters.categoryId && (
                    <Badge bg="primary" className="me-1">
                      {categories.find((c) => c.id == filters.categoryId)?.name}
                      <FontAwesomeIcon
                        icon={faTimes}
                        className="ms-1"
                        onClick={() =>
                          handleFilterChange({
                            target: { name: "categoryId", value: "" },
                          })
                        }
                        style={{ cursor: "pointer" }}
                      />
                    </Badge>
                  )}
                  {filters.minPrice && (
                    <Badge bg="info" className="me-1">
                      Min: ${filters.minPrice}
                      <FontAwesomeIcon
                        icon={faTimes}
                        className="ms-1"
                        onClick={() =>
                          handleFilterChange({
                            target: { name: "minPrice", value: "" },
                          })
                        }
                        style={{ cursor: "pointer" }}
                      />
                    </Badge>
                  )}
                  {filters.maxPrice && (
                    <Badge bg="info" className="me-1">
                      Max: ${filters.maxPrice}
                      <FontAwesomeIcon
                        icon={faTimes}
                        className="ms-1"
                        onClick={() =>
                          handleFilterChange({
                            target: { name: "maxPrice", value: "" },
                          })
                        }
                        style={{ cursor: "pointer" }}
                      />
                    </Badge>
                  )}
                  {filters.inStock && (
                    <Badge bg="success" className="me-1">
                      In Stock Only
                      <FontAwesomeIcon
                        icon={faTimes}
                        className="ms-1"
                        onClick={() =>
                          handleFilterChange({
                            target: { name: "inStock", checked: false },
                          })
                        }
                        style={{ cursor: "pointer" }}
                      />
                    </Badge>
                  )}
                </div>
              </div>
            </Col>

            <Col lg={6}>
              <div className="d-flex justify-content-end align-items-center gap-3">
                <Dropdown>
                  <Dropdown.Toggle
                    variant="outline-primary"
                    size="sm"
                    className="sort-dropdown"
                  >
                    <FontAwesomeIcon icon={faSort} className="me-1" />
                    {sortOptions.find(
                      (opt) =>
                        opt.value ===
                        `${filters.sort}${
                          filters.direction === "desc" ? ",desc" : ""
                        }`
                    )?.label || "Sort"}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {sortOptions.map((option) => (
                      <Dropdown.Item
                        key={option.value}
                        onClick={() => handleSortChange(option.value)}
                        active={
                          option.value ===
                          `${filters.sort}${
                            filters.direction === "desc" ? ",desc" : ""
                          }`
                        }
                      >
                        <FontAwesomeIcon icon={option.icon} className="me-2" />
                        {option.label}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>

                <Form.Select
                  size="sm"
                  className="w-auto page-size-select"
                  name="size"
                  value={filters.size}
                  onChange={handleFilterChange}
                >
                  <option value="12">12 per page</option>
                  <option value="24">24 per page</option>
                  <option value="48">48 per page</option>
                </Form.Select>

                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={clearFilters}
                  className="clear-filters-btn"
                >
                  <FontAwesomeIcon icon={faTimes} className="me-1" />
                  Clear All
                </Button>
              </div>
            </Col>
          </Row>
        </div>

        {/* Category Pills */}
        <div className="category-pills mb-4">
          <Button
            variant={!filters.categoryId ? "primary" : "outline-primary"}
            size="sm"
            className="me-2 mb-2"
            onClick={() =>
              handleFilterChange({ target: { name: "categoryId", value: "" } })
            }
          >
            All Categories
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={
                filters.categoryId == category.id
                  ? "primary"
                  : "outline-primary"
              }
              size="sm"
              className="me-2 mb-2"
              onClick={() =>
                handleFilterChange({
                  target: { name: "categoryId", value: category.id },
                })
              }
            >
              <FontAwesomeIcon icon={faTags} className="me-1" />
              {category.name}
            </Button>
          ))}
        </div>

        {/* Products Grid/List */}
        {loading ? (
          <div className="loading-container text-center py-5">
            <Spinner animation="border" variant="primary" size="lg" />
            <p className="mt-3 text-muted">Loading amazing products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="no-products text-center py-5">
            <div className="no-products-icon mb-3">
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                size="3x"
                className="text-muted"
              />
            </div>
            <h4>No products found</h4>
            <p className="text-muted mb-4">
              Try adjusting your filters or search terms to find what you're
              looking for
            </p>
            <Button variant="primary" onClick={clearFilters}>
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div
            className={viewMode === "list" ? "products-list" : "products-grid"}
          >
            {products.map((product) => (
              <Card
                key={product.id}
                className={`product-card ${
                  viewMode === "list"
                    ? "product-card-list"
                    : "product-card-grid"
                }`}
              >
                <div className="product-image-container">
                  <img
                    src={
                      product.images && product.images.length > 0
                        ? product.images[0].url
                        : "/placeholder-product.jpg"
                    }
                    alt={product.name}
                    className="product-image"
                    onError={(e) => {
                      e.target.src = "/placeholder-product.jpg";
                    }}
                    loading="lazy"
                  />

                  {/* Product Badges */}
                  <div className="product-badges">
                    {product.stock <= 10 && product.stock > 0 && (
                      <Badge bg="warning" className="stock-badge">
                        <FontAwesomeIcon icon={faFire} className="me-1" />
                        Low Stock
                      </Badge>
                    )}
                    {product.stock === 0 && (
                      <Badge bg="danger" className="stock-badge">
                        Out of Stock
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

                  {/* Quick Actions */}
                  <div className="product-actions">
                    <Button
                      variant="light"
                      size="sm"
                      className="action-btn"
                      onClick={() => toggleWishlist(product.id)}
                    >
                      <FontAwesomeIcon
                        icon={wishlist.has(product.id) ? faHeart : farHeart}
                        className={
                          wishlist.has(product.id) ? "text-danger" : ""
                        }
                      />
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
                    <div className="product-category">
                      {product.category?.name || "Uncategorized"}
                    </div>
                    <h6 className="product-title">{product.name}</h6>
                    <p className="product-description">
                      {product.description?.substring(0, 80)}...
                    </p>

                    <div className="product-rating">
                      <div className="rating-stars">
                        <FontAwesomeIcon icon={faStar} />
                        <FontAwesomeIcon icon={faStar} />
                        <FontAwesomeIcon icon={faStar} />
                        <FontAwesomeIcon icon={faStar} />
                        <FontAwesomeIcon icon={faStar} />
                      </div>
                      <span className="rating-text">4.5 (120)</span>
                    </div>

                    <div className="product-price">
                      <span className="current-price">
                        ₨{product.price?.toLocaleString()}
                      </span>
                      {product.originalPrice &&
                        product.originalPrice > product.price && (
                          <>
                            <span className="original-price">
                              ₨{product.originalPrice?.toLocaleString()}
                            </span>
                            <span className="discount-badge">
                              {Math.round(
                                ((product.originalPrice - product.price) /
                                  product.originalPrice) *
                                  100
                              )}
                              % OFF
                            </span>
                          </>
                        )}
                    </div>
                  </div>

                  <div className="product-actions-bottom">
                    <Button
                      variant="primary"
                      className="add-to-cart-btn"
                      onClick={() => addToCart(product)}
                      disabled={product.stock <= 0}
                    >
                      <FontAwesomeIcon icon={faShoppingCart} />
                      {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                    </Button>
                    <Button
                      variant="outline-secondary"
                      className="quick-view-btn"
                      as={Link}
                      to={`/products/${product.id}`}
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}

        {/* Enhanced Pagination */}
        {!loading && totalPages > 1 && (
          <div className="pagination-container">
            <div className="pagination-info text-center mb-3">
              <p className="text-muted mb-0">
                Showing {filters.page * filters.size + 1} to{" "}
                {Math.min((filters.page + 1) * filters.size, totalElements)} of{" "}
                {totalElements} products
              </p>
            </div>

            <div className="d-flex justify-content-center align-items-center">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page === 0}
                className="me-2"
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </Button>

              <div className="pagination-numbers">
                {generatePaginationItems()}
              </div>

              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page === totalPages - 1}
                className="ms-2"
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </Button>
            </div>
          </div>
        )}
      </Container>

      {/* Advanced Filters Modal */}
      <Modal
        show={showAdvancedFilters}
        onHide={() => setShowAdvancedFilters(false)}
        size="lg"
        className="advanced-filters-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faSlidersH} className="me-2" />
            Advanced Filters
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  name="categoryId"
                  value={filters.categoryId}
                  onChange={handleFilterChange}
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Sort By</Form.Label>
                <Form.Select
                  name="sort"
                  value={filters.sort}
                  onChange={handleFilterChange}
                >
                  <option value="name">Name</option>
                  <option value="price">Price</option>
                  <option value="createdAt">Newest</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Minimum Price</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="0"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Maximum Price</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="1000"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="In Stock Only"
                  name="inStock"
                  checked={filters.inStock}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="On Sale"
                  name="onSale"
                  checked={filters.onSale}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={clearFilters}>
            Clear All
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowAdvancedFilters(false)}
          >
            Apply Filters
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Shop;
