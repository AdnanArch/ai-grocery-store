import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Container } from "react-bootstrap";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Layout Components
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import ErrorBoundary from "./components/ErrorBoundary";

// Page Components
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import RequestResetPassword from "./pages/RequestResetPassword";
import OTPVerification from "./pages/OTPVerification";
import Account from "./pages/Account";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import AdminDashboard from "./pages/AdminDashboard";
import Wishlist from "./pages/Wishlist";
import ProductReviews from "./pages/ProductReviews";
import Payment from "./pages/Payment";
import PaymentSuccess from "./pages/PaymentSuccess";
import AIRecommendations from "./pages/AIRecommendations";
import AIChat from "./pages/AIChat";

// Context
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = React.useContext(AuthContext);
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location, message: "Please log in to access this page" }}
      />
    );
  }

  return children;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = React.useContext(AuthContext);
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location, message: "Please log in to access this page" }}
      />
    );
  }

  // Check if user has admin role
  if (!isAdmin) {
    return (
      <Navigate
        to="/"
        state={{ message: "Access denied. Admin privileges required." }}
      />
    );
  }

  return children;
};

function App() {
  const location = useLocation();

  // Check if current route is AI chat page
  const isAIChatPage = location.pathname === "/ai-chat";

  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <div className="app-container d-flex flex-column min-vh-100">
              <Header />
              <main className="flex-grow-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/products/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute>
                        <Checkout />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/order-confirmation/:id"
                    element={
                      <ProtectedRoute>
                        <OrderConfirmation />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route
                    path="/otp-verification"
                    element={<OTPVerification />}
                  />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route
                    path="/reset-password"
                    element={<RequestResetPassword />}
                  />
                  <Route
                    path="/reset-password/:token"
                    element={<ResetPassword />}
                  />
                  <Route
                    path="/account/*"
                    element={
                      <ProtectedRoute>
                        <Account />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders"
                    element={
                      <ProtectedRoute>
                        <Orders />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/wishlist"
                    element={
                      <ProtectedRoute>
                        <Wishlist />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/products/:productId/reviews"
                    element={<ProductReviews />}
                  />
                  <Route
                    path="/payment"
                    element={
                      <ProtectedRoute>
                        <Payment />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/payment-success" element={<PaymentSuccess />} />
                  <Route
                    path="/order-confirmation/:id"
                    element={
                      <ProtectedRoute>
                        <OrderConfirmation />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/ai-recommendations"
                    element={
                      <ProtectedRoute>
                        <AIRecommendations />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/ai-chat"
                    element={
                      <ProtectedRoute>
                        <AIChat />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              {!isAIChatPage && <Footer />}
              <ToastContainer
                position="bottom-right"
                autoClose={15000} // Increased from 5000 to 15000ms (15 seconds)
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                limit={1}
                theme="colored"
                style={{ zIndex: 9999 }}
                toastStyle={{ zIndex: 9999 }}
              />
            </div>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
