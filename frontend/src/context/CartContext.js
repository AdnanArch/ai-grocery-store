import React, { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Initialize cart from localStorage or empty array
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [coupon, setCoupon] = useState(() => {
    const savedCoupon = localStorage.getItem("coupon");
    return savedCoupon ? JSON.parse(savedCoupon) : null;
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Save coupon to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("coupon", JSON.stringify(coupon));
  }, [coupon]);

  // Add item to cart
  const addToCart = (product, quantity = 1) => {
    setCartItems((prevItems) => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex(
        (item) => item.id === product.id
      );

      if (existingItemIndex >= 0) {
        // Item exists, update quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
        };

        toast.success(`Updated ${product.name} quantity in your cart`);
        return updatedItems;
      } else {
        // Item doesn't exist, add new item
        toast.success(`${product.name} added to your cart`);
        return [...prevItems, { ...product, quantity }];
      }
    });
  };

  // Update item quantity
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prevItems) => {
      return prevItems.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      );
    });
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    setCartItems((prevItems) => {
      const itemToRemove = prevItems.find((item) => item.id === productId);
      if (itemToRemove) {
        toast.info(`${itemToRemove.name} removed from your cart`);
      }
      return prevItems.filter((item) => item.id !== productId);
    });
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
    setCoupon(null);
    toast.info("Your cart has been cleared");
  };

  // Apply coupon
  const applyCoupon = (code) => {
    // Simple coupon validation
    // In a real app, this would be validated on the server
    if (code === "WELCOME10") {
      setCoupon({
        code,
        discountType: "percentage",
        discountValue: 10,
        description: "10% off your order",
      });
      toast.success("Coupon applied: 10% off your order");
      return true;
    } else if (code === "FREESHIP") {
      setCoupon({
        code,
        discountType: "shipping",
        discountValue: 100,
        description: "Free shipping",
      });
      toast.success("Coupon applied: Free shipping");
      return true;
    } else {
      toast.error("Invalid coupon code");
      return false;
    }
  };

  // Remove coupon
  const removeCoupon = () => {
    setCoupon(null);
    toast.info("Coupon removed");
  };

  // Calculate cart totals
  const getCartTotals = () => {
    const subtotal = cartItems.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);

    // Calculate shipping (free over ₨5000)
    let shipping = subtotal >= 5000 ? 0 : 299;

    // Apply shipping discount if coupon is for free shipping
    if (coupon && coupon.discountType === "shipping") {
      shipping = 0;
    }

    // Calculate discount
    let discount = 0;
    if (coupon && coupon.discountType === "percentage") {
      discount = (subtotal * coupon.discountValue) / 100;
    }

    // Calculate tax (8%)
    const tax = (subtotal - discount) * 0.08;

    // Calculate total
    const total = subtotal - discount + shipping + tax;

    return {
      subtotal,
      shipping,
      discount,
      tax,
      total,
    };
  };

  // Get cart item count
  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  // Context value
  const value = {
    cartItems,
    coupon,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    getCartTotals,
    getCartCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartProvider;
