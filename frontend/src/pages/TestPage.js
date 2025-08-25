import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  Container,
  Form,
  Button,
  Card,
  Row,
  Col,
} from "react-bootstrap";
import api from "../utils/axios";

const TestPage = () => {
  const { user, login, register, logout } = useContext(AuthContext);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(loginData.email, loginData.password);
      setMessage("Login successful!");
      setError("");
    } catch (err) {
      setError("Login failed: " + err.message);
      setMessage("");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await register(registerData);
      setMessage("Registration successful!");
      setError("");
    } catch (err) {
      setError("Registration failed: " + err.message);
      setMessage("");
    }
  };

  const handleLogout = () => {
    logout();
    setMessage("Logged out successfully!");
    setError("");
  };

  return (
    <div
      style={{
        background: "#f8fbfa",
        fontFamily: "'Plus Jakarta Sans', 'Noto Sans', sans-serif",
        minHeight: "100vh",
      }}
    >
      <Container className="mt-4 py-5">
        <h2 
          className="fw-bold"
          style={{ color: "#0e1a13", fontSize: "2rem" }}
        >
          Authentication Test Page
        </h2>

      

      <Row>
        <Col md={4}>
          <Card className="mb-3">
            <Card.Header>Current User Status</Card.Header>
            <Card.Body>
              {user ? (
                <div>
                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p>
                    <strong>Name:</strong> {user.firstName} {user.lastName}
                  </p>
                  <p>
                    <strong>Roles:</strong>{" "}
                    {user.roles?.map((role) => role.name).join(", ")}
                  </p>
                  <Button variant="danger" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              ) : (
                <p>Not logged in</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="mb-3">
            <Card.Header>Login</Card.Header>
            <Card.Body>
              <Form onSubmit={handleLogin}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData({ ...loginData, email: e.target.value })
                    }
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                    required
                  />
                </Form.Group>
                <Button variant="primary" type="submit">
                  Login
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="mb-3">
            <Card.Header>Register</Card.Header>
            <Card.Body>
              <Form onSubmit={handleRegister}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={registerData.email}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        email: e.target.value,
                      })
                    }
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={registerData.password}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        password: e.target.value,
                      })
                    }
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={registerData.firstName}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        firstName: e.target.value,
                      })
                    }
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={registerData.lastName}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        lastName: e.target.value,
                      })
                    }
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="text"
                    value={registerData.phone}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        phone: e.target.value,
                      })
                    }
                    required
                  />
                </Form.Group>
                <Button variant="success" type="submit">
                  Register
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TestPage;
