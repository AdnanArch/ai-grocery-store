import { Badge } from "react-bootstrap";

/**
 * Get a consistent status badge for order statuses
 * @param {string} status - The order status
 * @returns {JSX.Element} - React Bootstrap Badge component
 */
export const getOrderStatusBadge = (status) => {
  if (!status) {
    return <Badge bg="secondary">Unknown</Badge>;
  }

  const statusLower = status.toLowerCase();

  switch (statusLower) {
    case "pending":
      return <Badge bg="warning">Pending</Badge>;
    case "paid":
      return <Badge bg="success">Paid</Badge>;
    case "processing":
      return <Badge bg="info">Processing</Badge>;
    case "shipped":
      return <Badge bg="primary">Shipped</Badge>;
    case "delivered":
      return <Badge bg="success">Delivered</Badge>;
    case "completed":
      return <Badge bg="success">Completed</Badge>;
    case "cancelled":
      return <Badge bg="danger">Cancelled</Badge>;
    case "payment_failed":
      return <Badge bg="danger">Payment Failed</Badge>;
    case "refunded":
      return <Badge bg="secondary">Refunded</Badge>;
    default:
      return <Badge bg="secondary">{status}</Badge>;
  }
};

/**
 * Get badge background color for order status
 * @param {string} status - The order status
 * @returns {string} - Bootstrap badge background class
 */
export const getOrderStatusBadgeColor = (status) => {
  if (!status) return "secondary";

  const statusLower = status.toLowerCase();

  switch (statusLower) {
    case "pending":
      return "warning";
    case "paid":
      return "success";
    case "processing":
      return "info";
    case "shipped":
      return "primary";
    case "delivered":
    case "completed":
      return "success";
    case "cancelled":
    case "payment_failed":
      return "danger";
    case "refunded":
      return "secondary";
    default:
      return "secondary";
  }
};

/**
 * Get user-friendly status text for order status
 * @param {string} status - The order status
 * @returns {string} - User-friendly status text
 */
export const getOrderStatusText = (status) => {
  if (!status) return "Unknown";

  const statusLower = status.toLowerCase();

  switch (statusLower) {
    case "pending":
      return "Pending";
    case "paid":
      return "Paid";
    case "processing":
      return "Processing";
    case "shipped":
      return "Shipped";
    case "delivered":
      return "Delivered";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    case "payment_failed":
      return "Payment Failed";
    case "refunded":
      return "Refunded";
    default:
      return status;
  }
};
