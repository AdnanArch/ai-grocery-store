package com.groceryapp.backend.service;

import com.groceryapp.backend.model.Order;
import com.groceryapp.backend.model.OrderItem;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Service
public class InvoiceService {

    public String generateInvoiceHTML(Order order) {
        StringBuilder html = new StringBuilder();
        
        // Get order date
        String orderDate = order.getCreatedAt() != null ? 
            LocalDateTime.ofInstant(order.getCreatedAt(), ZoneId.systemDefault())
                .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")) : "N/A";
        
        // Calculate subtotal from order items
        BigDecimal subtotal = BigDecimal.ZERO;
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                if (item.getProduct() != null) {
                    BigDecimal itemTotal = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                    subtotal = subtotal.add(itemTotal);
                }
            }
        }
        
        html.append("<!DOCTYPE html>");
        html.append("<html lang='en'>");
        html.append("<head>");
        html.append("<meta charset='UTF-8'>");
        html.append("<meta name='viewport' content='width=device-width, initial-scale=1.0'>");
        html.append("<title>Invoice #").append(order.getId()).append("</title>");
        html.append("<style>");
        html.append("body { font-family: Arial, sans-serif; margin: 20px; background-color: #f8f9fa; }");
        html.append(".invoice-container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }");
        html.append(".header { text-align: center; border-bottom: 3px solid #28a745; padding-bottom: 20px; margin-bottom: 30px; }");
        html.append(".header h1 { color: #28a745; margin: 0; font-size: 2.5em; }");
        html.append(".header p { color: #6c757d; margin: 5px 0; }");
        html.append(".order-info { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }");
        html.append(".info-section h3 { color: #495057; border-bottom: 2px solid #e9ecef; padding-bottom: 10px; margin-bottom: 15px; }");
        html.append(".info-section p { margin: 5px 0; color: #6c757d; }");
        html.append(".items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }");
        html.append(".items-table th, .items-table td { padding: 12px; text-align: left; border-bottom: 1px solid #dee2e6; }");
        html.append(".items-table th { background-color: #f8f9fa; font-weight: bold; color: #495057; }");
        html.append(".items-table tr:hover { background-color: #f8f9fa; }");
        html.append(".summary { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }");
        html.append(".summary-row { display: flex; justify-content: space-between; margin: 10px 0; }");
        html.append(".summary-row.total { font-weight: bold; font-size: 1.2em; border-top: 2px solid #dee2e6; padding-top: 15px; margin-top: 15px; }");
        html.append(".footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; }");
        html.append("@media print { body { background-color: white; } .invoice-container { box-shadow: none; } }");
        html.append("</style>");
        html.append("</head>");
        html.append("<body>");
        html.append("<div class='invoice-container'>");
        
        // Header
        html.append("<div class='header'>");
        html.append("<h1>🍃 FreshCart</h1>");
        html.append("<p>Your Fresh Grocery Store</p>");
        html.append("<h2>INVOICE</h2>");
        html.append("</div>");
        
        // Order Information
        html.append("<div class='order-info'>");
        html.append("<div class='info-section'>");
        html.append("<h3>Order Details</h3>");
        html.append("<p><strong>Order ID:</strong> #").append(order.getId()).append("</p>");
        html.append("<p><strong>Order Date:</strong> ").append(orderDate).append("</p>");
        html.append("<p><strong>Status:</strong> ").append(order.getStatus()).append("</p>");
        html.append("</div>");
        
        // Shipping Address
        html.append("<div class='info-section'>");
        html.append("<h3>Shipping Address</h3>");
        if (order.getShippingAddress() != null) {
            html.append("<p>").append(order.getShippingAddress().getStreet()).append("</p>");
            html.append("<p>").append(order.getShippingAddress().getCity()).append(", ").append(order.getShippingAddress().getState()).append(" ").append(order.getShippingAddress().getPostalCode()).append("</p>");
            html.append("<p>").append(order.getShippingAddress().getCountry()).append("</p>");
        } else {
            html.append("<p>No shipping address provided</p>");
        }
        html.append("</div>");
        html.append("</div>");
        
        // Order Items Table
        html.append("<h3>Order Items</h3>");
        html.append("<table class='items-table'>");
        html.append("<thead>");
        html.append("<tr>");
        html.append("<th>Product</th>");
        html.append("<th>Price (PKR)</th>");
        html.append("<th>Quantity</th>");
        html.append("<th>Total (PKR)</th>");
        html.append("</tr>");
        html.append("</thead>");
        html.append("<tbody>");
        
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                if (item.getProduct() != null) {
                    BigDecimal itemTotal = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                    html.append("<tr>");
                    html.append("<td>").append(item.getProduct().getName()).append("</td>");
                    html.append("<td>₨").append(item.getPrice().toPlainString()).append("</td>");
                    html.append("<td>").append(item.getQuantity()).append("</td>");
                    html.append("<td>₨").append(itemTotal.toPlainString()).append("</td>");
                    html.append("</tr>");
                }
            }
        }
        
        html.append("</tbody>");
        html.append("</table>");
        
        // Order Summary
        html.append("<div class='summary'>");
        html.append("<h3>Order Summary</h3>");
        html.append("<div class='summary-row'>");
        html.append("<span>Subtotal:</span>");
        html.append("<span>₨").append((order.getSubtotal() != null ? order.getSubtotal() : subtotal).toPlainString()).append("</span>");
        html.append("</div>");
        
        html.append("<div class='summary-row'>");
        html.append("<span>Shipping:</span>");
        String shippingText = order.getShippingCost() != null && order.getShippingCost().compareTo(BigDecimal.ZERO) == 0 ? 
            "Free" : "₨" + (order.getShippingCost() != null ? order.getShippingCost().toPlainString() : "0.00");
        html.append("<span>").append(shippingText).append("</span>");
        html.append("</div>");
        
        if (order.getTax() != null && order.getTax().compareTo(BigDecimal.ZERO) > 0) {
            html.append("<div class='summary-row'>");
            html.append("<span>Tax:</span>");
            html.append("<span>₨").append(order.getTax().toPlainString()).append("</span>");
            html.append("</div>");
        }
        
        if (order.getDiscount() != null && order.getDiscount().compareTo(BigDecimal.ZERO) > 0) {
            html.append("<div class='summary-row'>");
            html.append("<span>Discount:</span>");
            html.append("<span>-₨").append(order.getDiscount().toPlainString()).append("</span>");
            html.append("</div>");
        }
        
        html.append("<div class='summary-row total'>");
        html.append("<span>TOTAL:</span>");
        html.append("<span>₨").append(order.getTotalAmount().toPlainString()).append("</span>");
        html.append("</div>");
        html.append("</div>");
        
        // Footer
        html.append("<div class='footer'>");
        html.append("<p><strong>Thank you for your order!</strong></p>");
        html.append("<p>FreshCart - Your Fresh Grocery Store</p>");
        html.append("<p>This invoice was generated automatically</p>");
        html.append("</div>");
        
        html.append("</div>");
        html.append("</body>");
        html.append("</html>");
        
        return html.toString();
    }
}
