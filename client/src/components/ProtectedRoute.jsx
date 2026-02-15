import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; // or a loading spinner

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Only allow admin to access admin routes
  if (location.pathname.startsWith("/admin") && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
