import React, { useState } from "react";
import { Form, InputGroup, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="w-100">
      <InputGroup>
        <Form.Control
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search products"
          className="border-end-0"
        />
        <Button
          variant="outline-primary"
          type="submit"
          className="border-start-0 bg-white"
        >
          <FontAwesomeIcon icon={faSearch} />
        </Button>
      </InputGroup>
    </Form>
  );
};

export default SearchBar;
