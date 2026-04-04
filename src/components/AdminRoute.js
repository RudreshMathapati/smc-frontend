import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import SkeletonLoader from "./SkeletonLoader.js";
import UnauthorizedPage from "../pages/UnauthorizedPage.js";

const AdminRoute = ({ children }) => {
  const { user, loading } = useSelector((state) => state.auth);
  if (loading) return <SkeletonLoader />;

  if (!user) {
    return <Navigate to="/" replace />;
  }
  console.log("in admin route ", user);
  if (user.role !== "ADMIN") {
    return <UnauthorizedPage />;
  }
  return children;
};

export default AdminRoute;
