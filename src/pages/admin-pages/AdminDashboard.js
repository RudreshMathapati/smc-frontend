import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { toast } from "react-toastify";
import { FiTruck, FiMap, FiCpu, FiUsers, FiTrendingUp } from "react-icons/fi";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    buses: 0,
    routes: 0,
    posDevices: 0,
    users: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const [busRes, routeRes, posRes, userRes] = await Promise.all([
        axiosInstance.get("/api/buses"),
        axiosInstance.get("/api/routes"),
        axiosInstance.get("/api/pos-machines"),
        axiosInstance.get("/api/users"),
      ]);

      setStats({
        buses: busRes.data.length,
        routes: routeRes.data.length,
        posDevices: posRes.data.length,
        users: userRes.data.allUsers.length,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      toast.error("Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const cards = [
    {
      label: "Total Buses",
      value: stats.buses,
      color: "text-blue-600",
      bg: "bg-gradient-to-br from-blue-50 to-blue-100",
      icon: <FiTruck className="text-blue-500" size={24} />,
      trend: "up",
    },
    {
      label: "Total Routes",
      value: stats.routes,
      color: "text-emerald-600",
      bg: "bg-gradient-to-br from-emerald-50 to-emerald-100",
      icon: <FiMap className="text-emerald-500" size={24} />,
      trend: "up",
    },
    {
      label: "POS Devices",
      value: stats.posDevices,
      color: "text-violet-600",
      bg: "bg-gradient-to-br from-violet-50 to-violet-100",
      icon: <FiCpu className="text-violet-500" size={24} />,
      trend: "up",
    },
    {
      label: "Registered Users",
      value: stats.users,
      color: "text-amber-600",
      bg: "bg-gradient-to-br from-amber-50 to-amber-100",
      icon: <FiUsers className="text-amber-500" size={24} />,
      trend: "up",
    },
  ];

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
          color: "#6B7280",
        },
      },
      tooltip: {
        backgroundColor: "#1F2937",
        titleFont: {
          family: "'Inter', sans-serif",
          size: 14,
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 12,
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
          color: "#6B7280",
        },
      },
      y: {
        grid: {
          color: "#E5E7EB",
          borderDash: [4, 4],
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
          color: "#6B7280",
          precision: 0,
        },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeOutQuart",
    },
  };

  const chartData = {
    labels: ["Buses", "Routes", "POS Devices", "Users"],
    datasets: [
      {
        label: "Count",
        data: [stats.buses, stats.routes, stats.posDevices, stats.users],
        backgroundColor: [
          "rgba(79, 70, 229, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(139, 92, 246, 0.8)",
          "rgba(245, 158, 11, 0.8)",
        ],
        hoverBackgroundColor: [
          "rgba(79, 70, 229, 1)",
          "rgba(16, 185, 129, 1)",
          "rgba(139, 92, 246, 1)",
          "rgba(245, 158, 11, 1)",
        ],
        borderColor: [
          "rgba(79, 70, 229, 1)",
          "rgba(16, 185, 129, 1)",
          "rgba(139, 92, 246, 1)",
          "rgba(245, 158, 11, 1)",
        ],
        borderWidth: 1,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 min-h-screen bg-gray-50 font-sans">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 mt-2">
            Overview of your transportation system
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {cards.map((card, index) => (
            <div
              key={index}
              className={`rounded-xl border border-gray-200 shadow-sm p-5 transition-all duration-300 hover:shadow-md ${card.bg}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 tracking-wider">
                    {card.label}
                  </p>
                  {loading ? (
                    <Skeleton width={80} height={40} className="mt-2" />
                  ) : (
                    <div className="flex items-end mt-2">
                      <span className={`text-3xl font-bold ${card.color}`}>
                        {card.value}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-2 rounded-lg bg-white shadow-xs">
                  {card.icon}
                </div>
              </div>
              {!loading && (
                <div className="mt-4 flex items-center text-xs text-gray-500">
                  <FiTrendingUp className="mr-1 text-emerald-500" />
                  <span>+12% from last month</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-xl shadow-sm p-5 sm:p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              System Overview
            </h2>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-lg">
                Monthly
              </button>
              <button className="px-3 py-1 text-xs bg-gray-50 text-gray-600 rounded-lg">
                Yearly
              </button>
            </div>
          </div>

          <div className="h-[300px]">
            {loading ? (
              <Skeleton height={300} className="rounded-lg" />
            ) : (
              <Bar options={chartOptions} data={chartData} />
            )}
          </div>
        </div>

        {/* Additional Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mt-6">
          {/* Recent Activity */}
          {/* <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Recent Activity
            </h2>
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-lg mr-4">
                    <FiUsers className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      New user registered
                    </p>
                    <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </div> */}

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-4 gap-3">
              <button
                className="p-3 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                onClick={() => navigate("/admin/buses")}
              >
                Add New Bus
              </button>
              <button className="p-3 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors" onClick={()=>
                navigate("/admin/routes")
              }>
                Create Route
              </button>
              <button className="p-3 bg-violet-50 text-violet-600 rounded-lg text-sm font-medium hover:bg-violet-100 transition-colors" onClick={()=>
                navigate("/admin/pos-machines")
              }>
                Manage POS
              </button>
              <button className="p-3 bg-amber-50 text-amber-600 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors" onClick={()=>
                navigate("/admin/manage-bus-route-mapping")
              }>
                Bus-Route-Mapping
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
