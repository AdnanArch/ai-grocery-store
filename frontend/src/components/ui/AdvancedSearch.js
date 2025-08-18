import React, { useState, useEffect } from "react";
import { Form, Button, Card, Badge, Accordion, Range } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faFilter, faTimes } from "@fortawesome/free-solid-svg-icons";
import api from "../../utils/axios";

const AdvancedSearch = ({ onSearch, onFiltersChange }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    categoryId: "",
    minPrice: "",
    maxPrice: "",
    inStock: false,
    minRating: "",
    brand: "",
  });
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [popularSearches, setPopularSearches] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchBrands();
    fetchPopularSearches();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 2) {
      fetchSearchSuggestions();
    } else {
      setSearchSuggestions([]);
    }
  }, [searchQuery]);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/api/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchBrands = async () => {
    try {
      // This would typically come from a brands endpoint
      // For now, we'll use categories as a proxy
      const response = await api.get("/api/categories");
      setBrands(response.data);
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  const fetchSearchSuggestions = async () => {
    try {
      const response = await api.get(
        `/api/search/suggestions?query=${searchQuery}`
      );
      setSearchSuggestions(response.data);
    } catch (error) {
      console.error("Error fetching search suggestions:", error);
    }
  };

  const fetchPopularSearches = async () => {
    try {
      const response = await api.get("/api/search/popular");
      setPopularSearches(response.data);
    } catch (error) {
      console.error("Error fetching popular searches:", error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);

    const searchParams = {
      query: searchQuery,
      filters: filters,
    };

    onSearch(searchParams);
    onFiltersChange(filters);
    setLoading(false);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      categoryId: "",
      minPrice: "",
      maxPrice: "",
      inStock: false,
      minRating: "",
      brand: "",
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const selectSuggestion = (suggestion) => {
    setSearchQuery(suggestion);
    setSearchSuggestions([]);
  };

  const selectPopularSearch = (search) => {
    setSearchQuery(search.name);
  };

  const hasActiveFilters = () => {
    return Object.values(filters).some(
      (value) => value !== "" && value !== false && value !== null
    );
  };

  return (
    <div className="advanced-search">
      {/* Search Bar */}
      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <div className="d-flex gap-2">
              <div className="flex-grow-1 position-relative">
                <Form.Control
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-control-lg"
                />

                {/* Search Suggestions */}
                {searchSuggestions.length > 0 && (
                  <div
                    className="position-absolute w-100 bg-white border rounded shadow-sm"
                    style={{ zIndex: 1000, top: "100%" }}
                  >
                    {searchSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="p-2 border-bottom cursor-pointer hover-bg-light"
                        onClick={() => selectSuggestion(suggestion)}
                        style={{ cursor: "pointer" }}
                      >
                        <FontAwesomeIcon
                          icon={faSearch}
                          className="text-muted me-2"
                        />
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading}
              >
                {loading ? "Searching..." : <FontAwesomeIcon icon={faSearch} />}
              </Button>

              <Button
                type="button"
                variant={showFilters ? "outline-primary" : "outline-secondary"}
                size="lg"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FontAwesomeIcon icon={faFilter} />
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Popular Searches */}
      {popularSearches.length > 0 && (
        <Card className="mb-4">
          <Card.Body>
            <h6 className="mb-3">Popular Searches</h6>
            <div className="d-flex flex-wrap gap-2">
              {popularSearches.map((search, index) => (
                <Badge
                  key={index}
                  bg="light"
                  text="dark"
                  className="cursor-pointer"
                  onClick={() => selectPopularSearch(search)}
                  style={{ cursor: "pointer" }}
                >
                  {search.name}
                </Badge>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Advanced Filters */}
      {showFilters && (
        <Card className="mb-4">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">Advanced Filters</h6>
              {hasActiveFilters() && (
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={clearFilters}
                >
                  <FontAwesomeIcon icon={faTimes} className="me-1" />
                  Clear All
                </Button>
              )}
            </div>

            <div className="row g-3">
              {/* Category Filter */}
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    value={filters.categoryId}
                    onChange={(e) =>
                      handleFilterChange("categoryId", e.target.value)
                    }
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>

              {/* Brand Filter */}
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Brand</Form.Label>
                  <Form.Select
                    value={filters.brand}
                    onChange={(e) =>
                      handleFilterChange("brand", e.target.value)
                    }
                  >
                    <option value="">All Brands</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.name}>
                        {brand.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>

              {/* Price Range */}
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Price Range</Form.Label>
                  <div className="d-flex gap-2">
                    <Form.Control
                      type="number"
                      placeholder="Min Price"
                      value={filters.minPrice}
                      onChange={(e) =>
                        handleFilterChange("minPrice", e.target.value)
                      }
                    />
                    <Form.Control
                      type="number"
                      placeholder="Max Price"
                      value={filters.maxPrice}
                      onChange={(e) =>
                        handleFilterChange("maxPrice", e.target.value)
                      }
                    />
                  </div>
                </Form.Group>
              </div>

              {/* Rating Filter */}
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Minimum Rating</Form.Label>
                  <Form.Select
                    value={filters.minRating}
                    onChange={(e) =>
                      handleFilterChange("minRating", e.target.value)
                    }
                  >
                    <option value="">Any Rating</option>
                    <option value="4">4+ Stars</option>
                    <option value="3">3+ Stars</option>
                    <option value="2">2+ Stars</option>
                    <option value="1">1+ Stars</option>
                  </Form.Select>
                </Form.Group>
              </div>

              {/* Stock Filter */}
              <div className="col-12">
                <Form.Check
                  type="checkbox"
                  label="In Stock Only"
                  checked={filters.inStock}
                  onChange={(e) =>
                    handleFilterChange("inStock", e.target.checked)
                  }
                />
              </div>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters() && (
              <div className="mt-3">
                <h6 className="mb-2">Active Filters:</h6>
                <div className="d-flex flex-wrap gap-2">
                  {filters.categoryId && (
                    <Badge
                      bg="primary"
                      className="d-flex align-items-center gap-1"
                    >
                      Category:{" "}
                      {categories.find((c) => c.id == filters.categoryId)?.name}
                      <FontAwesomeIcon
                        icon={faTimes}
                        size="xs"
                        onClick={() => handleFilterChange("categoryId", "")}
                        style={{ cursor: "pointer" }}
                      />
                    </Badge>
                  )}
                  {filters.brand && (
                    <Badge
                      bg="primary"
                      className="d-flex align-items-center gap-1"
                    >
                      Brand: {filters.brand}
                      <FontAwesomeIcon
                        icon={faTimes}
                        size="xs"
                        onClick={() => handleFilterChange("brand", "")}
                        style={{ cursor: "pointer" }}
                      />
                    </Badge>
                  )}
                  {(filters.minPrice || filters.maxPrice) && (
                    <Badge
                      bg="primary"
                      className="d-flex align-items-center gap-1"
                    >
                      Price: ${filters.minPrice || "0"} - $
                      {filters.maxPrice || "∞"}
                      <FontAwesomeIcon
                        icon={faTimes}
                        size="xs"
                        onClick={() => {
                          handleFilterChange("minPrice", "");
                          handleFilterChange("maxPrice", "");
                        }}
                        style={{ cursor: "pointer" }}
                      />
                    </Badge>
                  )}
                  {filters.minRating && (
                    <Badge
                      bg="primary"
                      className="d-flex align-items-center gap-1"
                    >
                      Rating: {filters.minRating}+ Stars
                      <FontAwesomeIcon
                        icon={faTimes}
                        size="xs"
                        onClick={() => handleFilterChange("minRating", "")}
                        style={{ cursor: "pointer" }}
                      />
                    </Badge>
                  )}
                  {filters.inStock && (
                    <Badge
                      bg="primary"
                      className="d-flex align-items-center gap-1"
                    >
                      In Stock Only
                      <FontAwesomeIcon
                        icon={faTimes}
                        size="xs"
                        onClick={() => handleFilterChange("inStock", false)}
                        style={{ cursor: "pointer" }}
                      />
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default AdvancedSearch;
