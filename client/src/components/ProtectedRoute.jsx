import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const location = useLocation();

  if (!token || !user) return <Navigate to="/login" replace />;

  if (location.pathname.startsWith("/admin") && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
