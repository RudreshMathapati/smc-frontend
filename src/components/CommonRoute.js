import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import UnauthorizedPage from "../pages/UnauthorizedPage";

const CommonRoute = ({ children }) => {
  const { user, loading } = useSelector((state) => state.auth);

  if (loading) return <p>Loading...</p>;
  console.log("in common route ", user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "USER" || user.role !== "ADMIN") {
    return <UnauthorizedPage />;
  }

  return children;
};

export default CommonRoute;
