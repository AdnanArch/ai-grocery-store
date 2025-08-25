import React, { createContext, useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { AuthContext } from "./AuthContext";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);

  // Get user-specific cart key
  const getCartKey = () => {
    return user ? `cart_${user.id}` : "cart_guest";
  };

  const getCouponKey = () => {
    return user ? `coupon_${user.id}` : "coupon_guest";
  };

  // Initialize cart from localStorage or empty array
  const [cartItems, setCartItems] = useState([]);
  const [coupon, setCoupon] = useState(null);

  // Initialize cart and coupon when component mounts or user changes
  useEffect(() => {
    const cartKey = user ? `cart_${user.id}` : "cart_guest";
    const savedCart = localStorage.getItem(cartKey);
    setCartItems(savedCart ? JSON.parse(savedCart) : []);

    const couponKey = user ? `coupon_${user.id}` : "coupon_guest";
    const savedCoupon = localStorage.getItem(couponKey);
    setCoupon(savedCoupon ? JSON.parse(savedCoupon) : null);

    // Clear guest cart when user logs in (to prevent mixing guest and user carts)
    if (user && localStorage.getItem("cart_guest")) {
      localStorage.removeItem("cart_guest");
      localStorage.removeItem("coupon_guest");
    }

    // Debug logging
    console.log(
      `Cart loaded for user: ${
        user ? user.id : "guest"
      }, cartKey: ${cartKey}, items: ${
        savedCart ? JSON.parse(savedCart).length : 0
      }`
    );
  }, [user]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    const cartKey = user ? `cart_${user.id}` : "cart_guest";
    localStorage.setItem(cartKey, JSON.stringify(cartItems));
    console.log(
      `Cart saved for user: ${
        user ? user.id : "guest"
      }, cartKey: ${cartKey}, items: ${cartItems.length}`
    );
  }, [cartItems, user]);

  // Save coupon to localStorage whenever it changes
  useEffect(() => {
    const couponKey = user ? `coupon_${user.id}` : "coupon_guest";
    localStorage.setItem(couponKey, JSON.stringify(coupon));
  }, [coupon, user]);

  // Add item to cart
  const addToCart = (product, quantity = 1) => {
    console.log(
      `Adding ${product.name} to cart for user: ${user ? user.id : "guest"}`
    );
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

        toast.success(`Updated ${product.name} quantity in your cart`, {
          autoClose: 4000,
        });
        return updatedItems;
      } else {
        // Item doesn't exist, add new item
        toast.success(`${product.name} added to your cart`, {
          autoClose: 4000,
        });
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
        toast.info(`${itemToRemove.name} removed from your cart`, {
          autoClose: 4000,
        });
      }
      return prevItems.filter((item) => item.id !== productId);
    });
  };

  // Clear cart
  const clearCart = () => {
    // Only show toast if there are actually items to clear
    if (cartItems.length > 0) {
      setCartItems([]);
      setCoupon(null);
      toast.info("Your cart has been cleared");
    } else {
      // Just clear the state without showing toast
      setCartItems([]);
      setCoupon(null);
    }
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

    // Tax is included in product prices, no need to calculate separately
    // Calculate total
    const total = subtotal - discount + shipping;

    return {
      subtotal,
      shipping,
      discount,
      tax: 0, // Tax is included in product prices
      total,
    };
  };

  // Get cart item count
  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  // Debug function to log current cart state
  const debugCart = () => {
    const cartKey = user ? `cart_${user.id}` : "cart_guest";
    console.log(`=== Cart Debug Info ===`);
    console.log(`Current user: ${user ? user.id : "guest"}`);
    console.log(`Cart key: ${cartKey}`);
    console.log(`Cart items in state: ${cartItems.length}`);
    console.log(
      `Cart items in localStorage: ${
        localStorage.getItem(cartKey)
          ? JSON.parse(localStorage.getItem(cartKey)).length
          : 0
      }`
    );
    console.log(
      `All localStorage keys:`,
      Object.keys(localStorage).filter((key) => key.startsWith("cart_"))
    );
    console.log(`======================`);
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
    debugCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartProvider;
