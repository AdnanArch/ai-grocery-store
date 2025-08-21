import React, { useState, useEffect, useRef, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  ListGroup,
  Badge,
  Spinner,
  Alert,
  Modal,
  Dropdown,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRobot,
  faUser,
  faPaperPlane,
  faTrash,
  faSave,
  faHistory,
  faPlus,
  faTimes,
  faLightbulb,
  faUtensils,
  faLeaf,
  faShoppingCart,
  faStar,
  faClock,
  faCopy,
  faDownload,
  faMessage,
  faEllipsisH,
} from "@fortawesome/free-solid-svg-icons";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import api from "../utils/axios";

const AIChat = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isAuthenticated) {
      loadChatHistory();
    }
  }, [isAuthenticated]);

  const loadChatHistory = async () => {
    try {
      const response = await api.get("/api/ai/chat-history");
      setChatHistory(response.data);
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
  };

  const sendMessage = async (message = inputMessage) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      content: message,
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await api.post("/api/ai/chat", {
        message: message,
        chatId: currentChatId,
      });

      const aiMessage = {
        id: Date.now() + 1,
        content: response.data.response,
        sender: "ai",
        timestamp: new Date().toISOString(),
        chatId: response.data.chatId,
      };

      setMessages((prev) => [...prev, aiMessage]);
      setCurrentChatId(response.data.chatId);

      // Update chat history
      await loadChatHistory();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");

      const errorMessage = {
        id: Date.now() + 1,
        content:
          "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment.",
        sender: "ai",
        timestamp: new Date().toISOString(),
        isError: true,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    setSelectedChat(null);
    setShowNewChatModal(false);
  };

  const loadChat = async (chat) => {
    try {
      const response = await api.get(`/api/ai/chat/${chat.id}`);
      setMessages(response.data.messages);
      setCurrentChatId(chat.id);
      setSelectedChat(chat);
      setShowHistoryModal(false);
    } catch (error) {
      console.error("Error loading chat:", error);
      toast.error("Failed to load chat history.");
    }
  };

  const deleteChat = async (chatId) => {
    try {
      await api.delete(`/api/ai/chat/${chatId}`);
      await loadChatHistory();
      if (currentChatId === chatId) {
        startNewChat();
      }
      toast.success("Chat deleted successfully.");
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error("Failed to delete chat.");
    }
  };

  const saveChat = async () => {
    if (messages.length === 0) {
      toast.warning("No messages to save.");
      return;
    }

    try {
      await api.post("/api/ai/chat/save", {
        messages: messages,
        chatId: currentChatId,
      });
      toast.success("Chat saved successfully.");
      await loadChatHistory();
    } catch (error) {
      console.error("Error saving chat:", error);
      toast.error("Failed to save chat.");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const exportChat = () => {
    if (messages.length === 0) {
      toast.warning("No messages to export.");
      return;
    }

    const chatText = messages
      .map((msg) => `${msg.sender === "user" ? "You" : "AI"}: ${msg.content}`)
      .join("\n\n");

    const blob = new Blob([chatText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getChatTitle = (messages) => {
    if (messages.length === 0) return "New Chat";
    const firstMessage = messages[0].content;
    return firstMessage.length > 50
      ? firstMessage.substring(0, 50) + "..."
      : firstMessage;
  };

  const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const chatTime = new Date(timestamp);
    const diffInHours = Math.floor((now - chatTime) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return chatTime.toLocaleDateString();
  };

  return (
    <div className="ai-chat-page">
      <Container fluid className="h-100">
        <Row className="h-100">
          {/* Chat History Sidebar */}
          <Col lg={4} className="chat-sidebar">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Header className="bg-primary text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <FontAwesomeIcon icon={faMessage} className="me-2" />
                    Chat History
                  </h5>
                  <Button
                    variant="outline-light"
                    size="sm"
                    onClick={() => setShowNewChatModal(true)}
                  >
                    <FontAwesomeIcon icon={faPlus} />
                  </Button>
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="chat-actions p-3 border-bottom">
                  {messages.length > 0 && (
                    <>
                      <Button
                        variant="outline-success"
                        size="sm"
                        className="w-100 mb-2"
                        onClick={saveChat}
                      >
                        <FontAwesomeIcon icon={faSave} className="me-2" />
                        Save Chat
                      </Button>
                      <Button
                        variant="outline-info"
                        size="sm"
                        className="w-100"
                        onClick={exportChat}
                      >
                        <FontAwesomeIcon icon={faDownload} className="me-2" />
                        Export Chat
                      </Button>
                    </>
                  )}
                </div>

                <div className="chat-history-list">
                  {chatHistory.length === 0 ? (
                    <div className="text-center py-4">
                      <FontAwesomeIcon
                        icon={faHistory}
                        size="2x"
                        className="text-muted mb-3"
                      />
                      <p className="text-muted">No chat history yet</p>
                      <small className="text-muted">
                        Start a conversation to see your history here
                      </small>
                    </div>
                  ) : (
                    chatHistory.map((chat) => (
                      <div
                        key={chat.id}
                        className={`chat-history-item p-3 border-bottom ${
                          selectedChat?.id === chat.id ? "active" : ""
                        }`}
                        onClick={() => loadChat(chat)}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <h6 className="mb-1 text-truncate">
                              {getChatTitle(chat.messages || [])}
                            </h6>
                            <small className="text-muted">
                              <FontAwesomeIcon
                                icon={faClock}
                                className="me-1"
                              />
                              {formatRelativeTime(chat.updatedAt)}
                            </small>
                          </div>
                          <Dropdown>
                            <Dropdown.Toggle
                              variant="link"
                              size="sm"
                              className="p-0 text-muted"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FontAwesomeIcon icon={faEllipsisH} />
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item onClick={() => loadChat(chat)}>
                                <FontAwesomeIcon
                                  icon={faMessage}
                                  className="me-2"
                                />
                                Open Chat
                              </Dropdown.Item>
                              <Dropdown.Item
                                onClick={() => deleteChat(chat.id)}
                              >
                                <FontAwesomeIcon
                                  icon={faTrash}
                                  className="me-2"
                                />
                                Delete Chat
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Chat Area */}
          <Col lg={8} className="chat-main">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-0">
                      <FontAwesomeIcon
                        icon={faRobot}
                        className="me-2 text-primary"
                      />
                      Food & Grocery AI Assistant
                    </h5>
                    <small className="text-muted">
                      Ask me anything about food, recipes, nutrition, and
                      grocery shopping!
                    </small>
                  </div>
                  <div className="chat-status">
                    {isLoading ? (
                      <Badge bg="warning">
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-1"
                        />
                        Thinking...
                      </Badge>
                    ) : (
                      <Badge bg="success">
                        <FontAwesomeIcon icon={faStar} className="me-1" />
                        Online
                      </Badge>
                    )}
                  </div>
                </div>
              </Card.Header>

              <Card.Body className="chat-messages p-0">
                <div className="messages-container">
                  {messages.length === 0 ? (
                    <div className="welcome-message text-center">
                      <div className="welcome-icon">
                        <FontAwesomeIcon icon={faUtensils} />
                      </div>
                      <h4>Welcome to Your Food AI Assistant!</h4>
                      <p className="text-muted">
                        I'm here to help you with all things food and grocery
                        related. Ask me about recipes, nutrition, shopping tips,
                        and more!
                      </p>
                      <div className="feature-icons">
                        <FontAwesomeIcon
                          icon={faLeaf}
                          className="text-success"
                        />
                        <FontAwesomeIcon
                          icon={faShoppingCart}
                          className="text-primary"
                        />
                        <FontAwesomeIcon
                          icon={faUtensils}
                          className="text-warning"
                        />
                      </div>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`message ${message.sender} ${
                          message.isError ? "error" : ""
                        }`}
                      >
                        <div className="message-avatar">
                          <FontAwesomeIcon
                            icon={message.sender === "user" ? faUser : faRobot}
                            className={
                              message.sender === "user"
                                ? "text-primary"
                                : "text-success"
                            }
                          />
                        </div>
                        <div className="message-content">
                          <div className="message-text">{message.content}</div>
                          <div className="message-meta">
                            <small className="text-muted">
                              {formatTimestamp(message.timestamp)}
                            </small>
                            {message.sender === "ai" && (
                              <Button
                                variant="link"
                                size="sm"
                                className="p-0 ms-2"
                                onClick={() => copyToClipboard(message.content)}
                              >
                                <FontAwesomeIcon icon={faCopy} />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  {isLoading && (
                    <div className="message ai">
                      <div className="message-avatar">
                        <FontAwesomeIcon
                          icon={faRobot}
                          className="text-success"
                        />
                      </div>
                      <div className="message-content">
                        <div className="typing-indicator">
                          <Spinner animation="border" size="sm" />
                          <span className="ms-2">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </Card.Body>

              <Card.Footer className="bg-white border-top">
                <Form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                  }}
                >
                  <div className="modern-input-group">
                    <Form.Control
                      as="textarea"
                      rows={1}
                      placeholder="Ask me about food, recipes, nutrition, or grocery shopping..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isLoading}
                      className="modern-chat-input"
                      style={{
                        resize: "none",
                        border: "none",
                        boxShadow: "none",
                        fontSize: "16px",
                        padding: "12px 16px",
                        borderRadius: "25px",
                        backgroundColor: "#f8f9fa",
                      }}
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isLoading || !inputMessage.trim()}
                      className="modern-send-btn"
                      style={{
                        borderRadius: "50%",
                        width: "45px",
                        height: "45px",
                        padding: "0",
                        marginLeft: "10px",
                        boxShadow: "0 2px 8px rgba(0,123,255,0.3)",
                      }}
                    >
                      <FontAwesomeIcon icon={faPaperPlane} />
                    </Button>
                  </div>
                </Form>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* New Chat Modal */}
      <Modal show={showNewChatModal} onHide={() => setShowNewChatModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Start New Chat</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to start a new chat? Your current conversation
            will be cleared.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowNewChatModal(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={startNewChat}>
            Start New Chat
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AIChat;
