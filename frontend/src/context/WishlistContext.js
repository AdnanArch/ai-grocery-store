import React, { createContext, useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { AuthContext } from "./AuthContext";
import api from "../utils/axios";

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Initialize wishlist when user changes
  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setWishlistItems([]);
    }
  }, [user]);

  // Fetch user's wishlist from backend
  const fetchWishlist = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log("Fetching wishlist for user:", user.email);
      const response = await api.get("/api/wishlist");
      console.log("Wishlist response:", response.data);
      setWishlistItems(response.data);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      console.error("Error response:", error.response);
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  // Check if a product is in wishlist
  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item.product?.id === productId);
  };

  // Add product to wishlist
  const addToWishlist = async (product, wishlistName = "Default") => {
    if (!user) {
      toast.error("Please login to add items to wishlist");
      return false;
    }

    try {
      const response = await api.post("/api/wishlist/add", {
        productId: product.id,
        wishlistName: wishlistName,
      });

      // Refresh wishlist
      await fetchWishlist();
      toast.success(`${product.name} added to wishlist`, { autoClose: 4000 });
      return true;
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      if (error.response?.status === 400) {
        toast.info(`${product.name} is already in your wishlist`, {
          autoClose: 4000,
        });
      } else {
        toast.error("Failed to add to wishlist", { autoClose: 8000 });
      }
      return false;
    }
  };

  // Remove product from wishlist
  const removeFromWishlist = async (productId) => {
    if (!user) return false;

    try {
      console.log("Attempting to remove product from wishlist:", productId);
      const response = await api.delete(`/api/wishlist/${productId}`);
      console.log("Remove response:", response);
      await fetchWishlist();
      toast.success("Product removed from wishlist", { autoClose: 4000 });
      return true;
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      console.error("Error response:", error.response);
      console.error("Error status:", error.response?.status);
      console.error("Error data:", error.response?.data);
      const errorMessage =
        error.response?.data?.message || error.response?.status === 404
          ? "Product not found in wishlist"
          : error.response?.status === 403
          ? "Access denied"
          : error.response?.status === 500
          ? "Server error occurred"
          : "Failed to remove from wishlist";
      toast.error(errorMessage, { autoClose: 8000 });
      return false;
    }
  };

  // Toggle wishlist (add if not present, remove if present)
  const toggleWishlist = async (product) => {
    if (isInWishlist(product.id)) {
      return await removeFromWishlist(product.id);
    } else {
      return await addToWishlist(product);
    }
  };

  // Create new wishlist
  const createWishlist = async (name) => {
    if (!user) {
      toast.error("Please login to create wishlists");
      return false;
    }

    try {
      await api.post("/api/wishlist/create", { name });
      toast.success("Wishlist created successfully", { autoClose: 4000 });
      return true;
    } catch (error) {
      console.error("Error creating wishlist:", error);
      toast.error("Failed to create wishlist", { autoClose: 8000 });
      return false;
    }
  };

  // Get wishlist count
  const getWishlistCount = () => {
    return wishlistItems.length;
  };

  // Context value
  const value = {
    wishlistItems,
    loading,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    createWishlist,
    getWishlistCount,
    fetchWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistProvider;
