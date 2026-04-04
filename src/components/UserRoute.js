import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import UnauthorizedPage from "../pages/UnauthorizedPage";

const UserRoute = ({ children }) => {
  const { user, loading } = useSelector((state) => state.auth);

  if (loading) return <p>Loading...</p>;
  console.log("in private route ", user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role !== "USER") {
    return <UnauthorizedPage />;
  }

  return children;
};

export default UserRoute;
