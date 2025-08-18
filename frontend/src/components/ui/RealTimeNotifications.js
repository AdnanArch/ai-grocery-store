import React, { useState, useEffect, useContext } from "react";
import { Badge, Dropdown, ListGroup, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faTimes, faCheck } from "@fortawesome/free-solid-svg-icons";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";

const RealTimeNotifications = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stompClient, setStompClient] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (user) {
      connectWebSocket();
    }

    return () => {
      if (stompClient) {
        stompClient.disconnect();
      }
    };
  }, [user]);

  const connectWebSocket = () => {
    const socket = new SockJS("http://localhost:8080/ws");
    const client = Stomp.over(socket);

    client.connect(
      {},
      () => {
        console.log("Connected to WebSocket");
        setStompClient(client);

        // Subscribe to user-specific notifications
        client.subscribe(`/user/${user.id}/queue/notifications`, (message) => {
          const notification = JSON.parse(message.body);
          addNotification(notification);
        });

        // Subscribe to order updates
        client.subscribe(`/user/${user.id}/queue/orders`, (message) => {
          const orderUpdate = JSON.parse(message.body);
          handleOrderUpdate(orderUpdate);
        });

        // Subscribe to alerts
        client.subscribe(`/user/${user.id}/queue/alerts`, (message) => {
          const alert = JSON.parse(message.body);
          handleAlert(alert);
        });

        // Subscribe to cart updates
        client.subscribe(`/user/${user.id}/queue/cart`, (message) => {
          const cartUpdate = JSON.parse(message.body);
          handleCartUpdate(cartUpdate);
        });
      },
      (error) => {
        console.error("WebSocket connection error:", error);
      }
    );
  };

  const addNotification = (notification) => {
    const newNotification = {
      ...notification,
      id: Date.now(),
      timestamp: new Date(),
      read: false,
    };

    setNotifications((prev) => [newNotification, ...prev]);
    setUnreadCount((prev) => prev + 1);

    // Show toast notification
    toast.info(notification.message);
  };

  const handleOrderUpdate = (orderUpdate) => {
    const message = `Order #${orderUpdate.orderId} status updated to: ${orderUpdate.status}`;
    addNotification({
      type: "ORDER_UPDATE",
      title: "Order Status Update",
      message: message,
      notificationType: "order",
    });
  };

  const handleAlert = (alert) => {
    let message = "";
    let title = "";

    switch (alert.type) {
      case "STOCK_ALERT":
        title = "Low Stock Alert";
        message = `${alert.productName} is running low on stock (${alert.currentStock} remaining)`;
        break;
      case "PRICE_DROP":
        title = "Price Drop Alert";
        message = `${
          alert.productName
        } price dropped by ${alert.discount.toFixed(1)}%!`;
        break;
      default:
        title = "Alert";
        message = alert.message || "You have a new alert";
    }

    addNotification({
      type: "ALERT",
      title: title,
      message: message,
      notificationType: "alert",
    });
  };

  const handleCartUpdate = (cartUpdate) => {
    const message = `Your cart has been updated: ${
      cartUpdate.itemCount
    } items, $${cartUpdate.total.toFixed(2)}`;
    addNotification({
      type: "CART_UPDATE",
      title: "Cart Updated",
      message: message,
      notificationType: "cart",
    });
  };

  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    setUnreadCount(0);
  };

  const removeNotification = (notificationId) => {
    setNotifications((prev) =>
      prev.filter((notif) => notif.id !== notificationId)
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "ORDER_UPDATE":
        return "📦";
      case "ALERT":
        return "⚠️";
      case "CART_UPDATE":
        return "🛒";
      case "NOTIFICATION":
        return "🔔";
      default:
        return "📢";
    }
  };

  const getNotificationClass = (type) => {
    switch (type) {
      case "ORDER_UPDATE":
        return "border-primary";
      case "ALERT":
        return "border-warning";
      case "CART_UPDATE":
        return "border-info";
      default:
        return "border-secondary";
    }
  };

  return (
    <div className="position-relative">
      <Dropdown show={showDropdown} onToggle={setShowDropdown}>
        <Dropdown.Toggle
          variant="link"
          className="text-decoration-none position-relative notification-toggle"
          style={{
            padding: "0.75rem",
            borderRadius: "12px",
            border: "2px solid #e5e7eb",
            background: "white",
            color: "#0e1a13",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: "45px",
            height: "45px",
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = "#38e07b";
            e.target.style.transform = "translateY(-1px)";
            e.target.style.boxShadow = "0 4px 12px rgba(56, 224, 123, 0.15)";
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = "#e5e7eb";
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "none";
          }}
        >
          <FontAwesomeIcon
            icon={faBell}
            style={{
              fontSize: "1.1rem",
              color: "#38e07b",
            }}
          />
          {unreadCount > 0 && (
            <Badge
              bg="danger"
              className="position-absolute top-0 start-100 translate-middle"
              style={{
                fontSize: "0.7rem",
                minWidth: "20px",
                height: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "10px",
                fontWeight: "600",
                border: "2px solid white",
              }}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Dropdown.Toggle>

        <Dropdown.Menu
          className="p-0"
          style={{ width: "350px", maxHeight: "400px", overflowY: "auto" }}
        >
          <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
            <h6 className="mb-0">Notifications</h6>
            {unreadCount > 0 && (
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={markAllAsRead}
              >
                Mark all as read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="p-3 text-center text-muted">
              <FontAwesomeIcon icon={faBell} size="2x" className="mb-2" />
              <p className="mb-0">No notifications yet</p>
            </div>
          ) : (
            <ListGroup variant="flush">
              {notifications.slice(0, 10).map((notification) => (
                <ListGroup.Item
                  key={notification.id}
                  className={`d-flex align-items-start p-3 ${getNotificationClass(
                    notification.type
                  )} ${!notification.read ? "bg-light" : ""}`}
                  style={{ borderLeft: `4px solid` }}
                >
                  <div className="me-2 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start">
                      <h6 className="mb-1" style={{ fontSize: "0.9rem" }}>
                        {notification.title}
                      </h6>
                      <button
                        className="btn btn-sm btn-link text-muted p-0"
                        onClick={() => removeNotification(notification.id)}
                      >
                        <FontAwesomeIcon icon={faTimes} size="xs" />
                      </button>
                    </div>
                    <p className="mb-1" style={{ fontSize: "0.8rem" }}>
                      {notification.message}
                    </p>
                    <small className="text-muted">
                      {new Date(notification.timestamp).toLocaleString()}
                    </small>
                    {!notification.read && (
                      <button
                        className="btn btn-sm btn-outline-success ms-2"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <FontAwesomeIcon icon={faCheck} size="xs" />
                      </button>
                    )}
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}

          {notifications.length > 10 && (
            <div className="p-2 text-center border-top">
              <small className="text-muted">
                Showing 10 of {notifications.length} notifications
              </small>
            </div>
          )}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default RealTimeNotifications;
