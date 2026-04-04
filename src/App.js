import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  // Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useDispatch } from "react-redux";
import { fetchUser } from "./slices/authSlice";
import UserRoute from "./components/UserRoute.js";
import AdminRoute from "./components/AdminRoute.js";

//Language Page
import LanguageSelector from "./components/LanguageSelector.js";

// User Pages
import CommonLogin from "./pages/user-pages/CommonLogin.js";
import SignUp from "./pages/user-pages/SignUp.js";
import Home from "./pages/user-pages/Home.js";
import Profile from "./pages/user-pages/Profile.js";
import BusRouteStops from "./pages/user-pages/BusRouteStops.js";
import LiveBuses from "./pages/user-pages/LiveBuses.js";

// Admin Pages
// import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./pages/admin-pages/AdminDashboard.js";
import AllUsers from "./pages/admin-pages/AllUsers.js";
import ManageBusRouteMapping from "./pages/admin-pages/ManageBusRouteMapping.js";
import "leaflet/dist/leaflet.css";
import Buses from "./pages/admin-pages/Buses.js";
import ManageRoutes from "./pages/admin-pages/ManageRoutes.js";
import ManagePOSMachines from "./pages/admin-pages/ManagePosMachine.js";
import ManageBusPosMapping from "./pages/admin-pages/ManageBusPosMapping.js";
import PageNotFound from "./pages/PageNotFound.js";
import Conductors from "./pages/admin-pages/Conductors.js";
import ManageStopPrices from "./pages/admin-pages/ManageStopPrices.js";
import ManagePasses from "./pages/admin-pages/ManagePasses.js";
import GoogleLiveMap from "./pages/admin-pages/GoogleLiveMap.js";
import ConductorBusAssign from "./pages/admin-pages/ConductorBusAssign";
import ConductorReport from "./pages/admin-pages/ConductorReport";

//demo
import FareCalculator from "./pages/FareCalculator";
import ManageFareCharts from "./pages/admin-pages/ManageFareCharts.js";

const App = () => {
  const dispatch = useDispatch();
  const [languageChosen, setLanguageChosen] = useState(false);

  useEffect(() => {
    const lang = localStorage.getItem("i18nextLng");
    if (lang) setLanguageChosen(true);

    // Fetch user from backend (uses cookie)
    dispatch(fetchUser());
  }, [dispatch]);

  const handleContinue = () => {
    setLanguageChosen(true);
  };

  return (
    <>
      <Router>
        {!languageChosen ? (
          <LanguageSelector onContinue={handleContinue} />
        ) : (
          <Routes>
            <Route
              path="/admin/conductor-report"
              element={<ConductorReport />}
            />
            <Route
              path="/admin/conductor-bus-assign"
              element={<ConductorBusAssign />}
            />
            <Route path="/admin/farecharts" element={<ManageFareCharts />} />
            <Route path="/fare" element={<FareCalculator />} />
            {/* common route */}
            <Route path="/" element={<LanguageSelector />} />

            {/* Auth Routes */}
            <Route path="/login" element={<CommonLogin />} />
            <Route path="/register" element={<SignUp />} />

            {/* User Protected Routes */}
            <Route
              path="/home"
              element={
                <UserRoute>
                  <Home />
                </UserRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <UserRoute>
                  <Profile />
                </UserRoute>
              }
            />
            <Route
              path="/route/:busID"
              element={
                <UserRoute>
                  <BusRouteStops />
                </UserRoute>
              }
            />

            <Route
              path="/live-buses"
              element={
                <UserRoute>
                  <LiveBuses />
                </UserRoute>
              }
            />

            {/* Admin Auth Route */}
            {/* <Route path="/admin/login" element={<AdminLogin />} /> */}

            {/* Admin Protected Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/manage-bus-route-mapping"
              element={
                <AdminRoute>
                  <ManageBusRouteMapping />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/conductors"
              element={
                <AdminRoute>
                  <Conductors />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/stop-price"
              element={
                <AdminRoute>
                  <ManageStopPrices />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/passes"
              element={
                <AdminRoute>
                  <ManagePasses />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/live-tracking"
              element={
                <AdminRoute>
                  <GoogleLiveMap />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/all-users"
              element={
                <AdminRoute>
                  <AllUsers />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/buses"
              element={
                <AdminRoute>
                  <Buses />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/routes"
              element={
                <AdminRoute>
                  <ManageRoutes />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/pos-machines"
              element={
                <AdminRoute>
                  <ManagePOSMachines />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/bus-pos-mapping"
              element={
                <AdminRoute>
                  <ManageBusPosMapping />
                </AdminRoute>
              }
            />

            <Route path="*" element={<PageNotFound />} />
          </Routes>
        )}
      </Router>

      {/* Global Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
};

export default App;
