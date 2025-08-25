import React, { useState, useEffect, useContext, useRef } from "react";
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
  Modal,
  Alert,
  InputGroup,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRobot,
  faUser,
  faPaperPlane,
  faPlus,
  faTrash,
  faEdit,
  faSave,
  faTimes,
  faLightbulb,
  faUtensils,
  faShoppingCart,
  faLeaf,
  faClock,
  faStar,
  faMessage,
  faBrain,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import api from "../utils/axios";
import "../styles/ai-chat.css";

const AIChat = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [editingTitle, setEditingTitle] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions] = useState([
    "What are some healthy breakfast ideas?",
    "How do I store fresh vegetables?",
    "Can you suggest budget-friendly meal options?",
    "What's the difference between organic and conventional produce?",
    "How do I meal prep for the week?",
    "What are some quick dinner recipes?",
    "How do I read nutrition labels?",
    "What seasonal fruits are available now?",
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history on component mount
  useEffect(() => {
    if (isAuthenticated) {
      loadChatHistory();
    }
  }, [isAuthenticated]);

  // Load chat history
  const loadChatHistory = async () => {
    try {
      setChatLoading(true);
      const response = await api.get("/api/ai/chat-history");
      setChats(response.data);
    } catch (error) {
      console.error("Error loading chat history:", error);
      toast.error("Failed to load chat history");
    } finally {
      setChatLoading(false);
    }
  };

  // Load specific chat
  const loadChat = async (chatId) => {
    try {
      setChatLoading(true);
      const response = await api.get(`/api/ai/chat/${chatId}`);
      setCurrentChat(response.data.chat);
      setMessages(response.data.messages);
      setEditingTitle(response.data.chat.title);
    } catch (error) {
      console.error("Error loading chat:", error);
      toast.error("Failed to load chat");
    } finally {
      setChatLoading(false);
    }
  };

  // Start new chat
  const startNewChat = () => {
    setCurrentChat(null);
    setMessages([]);
    setNewMessage("");
    setEditingTitle("New Chat");
    setShowNewChatModal(false);
    inputRef.current?.focus();
  };

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      content: newMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");
    setLoading(true);

    try {
      const response = await api.post("/api/ai/chat", {
        message: newMessage,
        chatId: currentChat?.id || null,
      });

      const aiMessage = {
        id: Date.now() + 1,
        content: response.data.response,
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Update current chat or create new one
      if (!currentChat) {
        const newChat = {
          id: response.data.chatId,
          title: "New Chat",
          lastMessage: response.data.response.substring(0, 100) + "...",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setCurrentChat(newChat);
        setChats((prev) => [newChat, ...prev]);
      } else {
        // Update existing chat
        const updatedChat = { ...currentChat };
        updatedChat.lastMessage =
          response.data.response.substring(0, 100) + "...";
        updatedChat.updatedAt = new Date();
        setCurrentChat(updatedChat);

        // Update in chats list
        setChats((prev) =>
          prev.map((chat) => (chat.id === currentChat.id ? updatedChat : chat))
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");

      // Remove the user message if it failed
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
    } finally {
      setLoading(false);
    }
  };

  // Delete chat
  const deleteChat = async (chatId, e) => {
    e.stopPropagation(); // Prevent chat selection when clicking delete

    if (!window.confirm("Are you sure you want to delete this chat?")) return;

    try {
      await api.delete(`/api/ai/chat/${chatId}`);

      if (currentChat?.id === chatId) {
        setCurrentChat(null);
        setMessages([]);
      }

      setChats((prev) => prev.filter((chat) => chat.id !== chatId));
      toast.success("Chat deleted successfully");
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error("Failed to delete chat");
    }
  };

  // Save chat title
  const saveChatTitle = async () => {
    if (!currentChat || !editingTitle.trim()) return;

    try {
      await api.post("/api/ai/chat/save", {
        chatId: currentChat.id.toString(),
        title: editingTitle.trim(),
      });

      const updatedChat = { ...currentChat, title: editingTitle.trim() };
      setCurrentChat(updatedChat);

      // Update in chats list
      setChats((prev) =>
        prev.map((chat) => (chat.id === currentChat.id ? updatedChat : chat))
      );

      setIsEditingTitle(false);
      toast.success("Chat title saved");
    } catch (error) {
      console.error("Error saving chat title:", error);
      toast.error("Failed to save chat title");
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Format date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  // Filter chats based on search
  const filteredChats = chats.filter(
    (chat) =>
      chat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <Container className="py-5">
        <Alert variant="info">
          Please <a href="/login">login</a> to access the AI Chat feature.
        </Alert>
      </Container>
    );
  }

  return (
    <div
      className="ai-chat-compact"
      style={{ height: "100vh", position: "sticky", top: 0 }}
    >
      <Container fluid className="py-3" style={{ height: "100%" }}>
        <Row className="g-3" style={{ height: "100%" }}>
          {/* Compact Chat Sidebar */}
          <Col lg={3} xl={2} style={{ height: "100%" }}>
            <Card className="chat-sidebar-compact h-100">
              <Card.Header className="chat-header-compact">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex align-items-center">
                    <div className="header-icon-compact">
                      <FontAwesomeIcon icon={faBrain} />
                    </div>
                    <h6 className="mb-0 ms-2">AI Chats</h6>
                  </div>
                  <Button
                    variant="outline-light"
                    size="sm"
                    onClick={() => setShowNewChatModal(true)}
                    className="new-chat-btn-compact"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                  </Button>
                </div>

                {/* Search Bar */}
                <div className="search-container">
                  <InputGroup size="sm">
                    <InputGroup.Text className="search-icon">
                      <FontAwesomeIcon icon={faSearch} />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search chats..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                  </InputGroup>
                </div>
              </Card.Header>

              <Card.Body className="p-0">
                {chatLoading ? (
                  <div className="text-center py-3">
                    <Spinner animation="border" size="sm" variant="primary" />
                  </div>
                ) : filteredChats.length === 0 ? (
                  <div className="empty-state-compact">
                    <FontAwesomeIcon
                      icon={faMessage}
                      size="2x"
                      className="mb-2"
                    />
                    <p className="mb-2">No chats found</p>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setShowNewChatModal(true)}
                    >
                      Start New Chat
                    </Button>
                  </div>
                ) : (
                  <ListGroup variant="flush" className="chat-list-compact">
                    {filteredChats.map((chat) => (
                      <ListGroup.Item
                        key={chat.id}
                        action
                        onClick={() => loadChat(chat.id)}
                        className={`chat-item-compact ${
                          currentChat?.id === chat.id ? "active" : ""
                        }`}
                      >
                        <div className="chat-item-content-compact">
                          <div className="chat-title-compact">
                            {chat.title || "New Chat"}
                          </div>
                          <div className="chat-preview-compact">
                            {chat.lastMessage || "No messages yet"}
                          </div>
                          <div className="chat-meta-compact">
                            <FontAwesomeIcon icon={faClock} className="me-1" />
                            {formatDate(chat.updatedAt)}
                          </div>
                        </div>
                        <div className="chat-actions-compact">
                          <Button
                            variant="light"
                            size="sm"
                            onClick={(e) => deleteChat(chat.id, e)}
                            className="delete-btn-compact"
                            title="Delete chat"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Main Chat Area */}
          <Col lg={9} xl={10} style={{ height: "100%" }}>
            <Card className="chat-main-compact h-100">
              <Card.Header className="chat-main-header-compact">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="chat-title-section-compact">
                    {currentChat ? (
                      <div className="d-flex align-items-center">
                        {isEditingTitle ? (
                          <div className="title-edit-form-compact">
                            <InputGroup size="sm">
                              <Form.Control
                                type="text"
                                value={editingTitle}
                                onChange={(e) =>
                                  setEditingTitle(e.target.value)
                                }
                                className="title-input-compact"
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    saveChatTitle();
                                  }
                                }}
                              />
                              <Button
                                variant="success"
                                size="sm"
                                onClick={saveChatTitle}
                                className="save-btn-compact"
                              >
                                <FontAwesomeIcon icon={faSave} />
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                  setIsEditingTitle(false);
                                  setEditingTitle(currentChat.title);
                                }}
                                className="cancel-btn-compact"
                              >
                                <FontAwesomeIcon icon={faTimes} />
                              </Button>
                            </InputGroup>
                          </div>
                        ) : (
                          <div className="chat-title-display-compact">
                            <FontAwesomeIcon icon={faRobot} className="me-2" />
                            <span className="title-text-compact">
                              {currentChat.title}
                            </span>
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => setIsEditingTitle(true)}
                              className="edit-btn-compact"
                              title="Edit title"
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="welcome-title-compact">
                        <FontAwesomeIcon icon={faRobot} className="me-2" />
                        AI Assistant
                      </div>
                    )}
                  </div>
                  <div className="chat-time-compact">
                    <FontAwesomeIcon icon={faClock} className="me-1" />
                    {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </Card.Header>

              <Card.Body className="chat-body-compact p-0">
                {/* Messages Area */}
                <div className="messages-area-compact">
                  {messages.length === 0 ? (
                    <div className="welcome-screen-compact">
                      <div className="welcome-icon-compact">
                        <FontAwesomeIcon icon={faRobot} size="3x" />
                      </div>
                      <h4>Welcome to AI Assistant! 👋</h4>
                      <p className="welcome-subtitle-compact">
                        I'm here to help you with cooking, nutrition, grocery
                        shopping, and more!
                      </p>

                      {/* Quick Suggestions */}
                      <div className="suggestions-grid-compact">
                        {suggestions.map((suggestion, index) => (
                          <div key={index} className="suggestion-card-compact">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="suggestion-btn-compact"
                              onClick={() => setNewMessage(suggestion)}
                            >
                              <div className="suggestion-icon-compact">
                                <FontAwesomeIcon
                                  icon={
                                    index < 3
                                      ? faUtensils
                                      : index < 5
                                      ? faShoppingCart
                                      : faLeaf
                                  }
                                />
                              </div>
                              <span className="suggestion-text-compact">
                                {suggestion}
                              </span>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="messages-container-compact">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`message-wrapper-compact ${
                            message.sender === "user"
                              ? "user-message"
                              : "ai-message"
                          }`}
                        >
                          <div className="message-bubble-compact">
                            <div className="message-header-compact">
                              {message.sender === "ai" && (
                                <FontAwesomeIcon
                                  icon={faRobot}
                                  className="ai-icon-compact"
                                />
                              )}
                              {message.sender === "user" && (
                                <FontAwesomeIcon
                                  icon={faUser}
                                  className="user-icon-compact"
                                />
                              )}
                              <span className="message-sender-compact">
                                {message.sender === "ai"
                                  ? "AI Assistant"
                                  : "You"}
                              </span>
                              <span className="message-time-compact">
                                {formatTime(message.timestamp)}
                              </span>
                            </div>
                            <div className="message-content-compact">
                              {message.content}
                            </div>
                          </div>
                        </div>
                      ))}
                      {loading && (
                        <div className="message-wrapper-compact ai-message">
                          <div className="message-bubble-compact">
                            <div className="message-header-compact">
                              <FontAwesomeIcon
                                icon={faRobot}
                                className="ai-icon-compact"
                              />
                              <span className="message-sender-compact">
                                AI Assistant
                              </span>
                            </div>
                            <div className="thinking-indicator-compact">
                              <Spinner
                                animation="border"
                                size="sm"
                                className="me-2"
                              />
                              <span>AI is thinking...</span>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="message-input-section-compact">
                  <Form onSubmit={sendMessage} className="message-form-compact">
                    <div className="input-group-wrapper-compact">
                      <Form.Control
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Ask me anything about food, cooking, or grocery shopping..."
                        disabled={loading}
                        className="message-input-compact"
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage(e);
                          }
                        }}
                      />
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={!newMessage.trim() || loading}
                        className="send-btn-compact"
                      >
                        {loading ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          <FontAwesomeIcon icon={faPaperPlane} />
                        )}
                      </Button>
                    </div>
                  </Form>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* New Chat Modal */}
      <Modal
        show={showNewChatModal}
        onHide={() => setShowNewChatModal(false)}
        className="new-chat-modal-compact"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Start New Chat
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Start a new conversation with your AI assistant about:</p>
          <div className="modal-suggestions-compact">
            <div className="suggestion-item-compact">
              <FontAwesomeIcon icon={faUtensils} className="me-2" />
              Cooking and recipes
            </div>
            <div className="suggestion-item-compact">
              <FontAwesomeIcon icon={faLeaf} className="me-2" />
              Nutrition and health
            </div>
            <div className="suggestion-item-compact">
              <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
              Grocery shopping tips
            </div>
            <div className="suggestion-item-compact">
              <FontAwesomeIcon icon={faLightbulb} className="me-2" />
              Budget-friendly meal planning
            </div>
            <div className="suggestion-item-compact">
              <FontAwesomeIcon icon={faClock} className="me-2" />
              Food storage and preservation
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowNewChatModal(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={startNewChat}>
            Start Chat
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AIChat;
