import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { toast } from "react-toastify";
import {
  FiTruck,
  FiTrendingUp,
  FiPlay,
  FiPause,
  FiTool,
  FiCheckCircle,
  FiDollarSign,
  FiCalendar,
  FiRefreshCw,
  FiActivity,
  FiWifi,
} from "react-icons/fi";
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
import { io } from "socket.io-client";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

let socket;

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const [stats, setStats] = useState({
    buses: 0,
    routes: 0,
    posDevices: 0,
    users: 0,
  });

  const [fleetStatus, setFleetStatus] = useState({
    totalBuses: 0,
    runningBuses: 0,
    idleBuses: 0,
    breakdownBuses: 0,
    tripsRunningNow: 0,
    tripsCompletedToday: 0,
  });

  const [revenueStats, setRevenueStats] = useState({
    collectionToday: 0,
    collectionThisWeek: 0,
    collectionThisMonth: 0,
    ticketRevenue: 0,
    passRevenue: 0,
  });

  // Socket Real-time connection
  useEffect(() => {
    socket = io(process.env.REACT_APP_API_URL);

    socket.on("connect", () => {
      console.log("✅ Connected:", socket.id);
    });

    socket.on("dashboard:update", (data) => {
      console.log("🔥 LIVE DATA:", data);

      setFleetStatus(data.fleet);
      setRevenueStats(data.revenue);
      setStats(data.stats);

      setLoading(false);
      setRefreshing(false);
      setLastUpdated(new Date());
    });

    socket.on("dashboard:error", (err) => {
      console.error("❌ Socket Error:", err);
      toast.error(err.message || "Real-time update failed");
    });

    // Initial fetch to avoid 10s delay
    const fetchInitialData = async () => {
      try {
        const response = await axiosInstance.get("/api/dashboard/analytics");
        const data = response.data;
        setFleetStatus(data.fleet);
        setRevenueStats(data.revenue);
        setStats(data.stats);
        setLoading(false);
      } catch (err) {
        console.error("❌ Initial Fetch Error:", err);
        // Don't toast here as socket might eventually pick up
      }
    };

    fetchInitialData();

    return () => socket.disconnect();
  }, []);

  // Manual refresh (UI effect only)
  const handleManualRefresh = () => {
    setRefreshing(true);
    toast.info("Refreshing dashboard data...");
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate active and inactive buses
  const activeBuses = fleetStatus.runningBuses;
  const inactiveBuses = fleetStatus.idleBuses + fleetStatus.breakdownBuses;

  // Custom tooltip for chart
  const customTooltip = (context) => {
    const label = context.tooltip.label || "";
    const value = context.tooltip.raw || 0;

    if (label === "Buses") {
      return {
        title: ["Buses Breakdown"],
        beforeBody: [`Total: ${value}`],
        afterBody: [
          `Active: ${activeBuses}`,
          `Inactive: ${inactiveBuses}`,
          `  • Idle: ${fleetStatus.idleBuses}`,
          `  • Breakdown: ${fleetStatus.breakdownBuses}`,
        ],
      };
    }
    return null;
  };

  const systemChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            const label = tooltipItems[0].label;
            if (label === "Buses") {
              return "Buses Breakdown";
            }
            return label;
          },
          label: (context) => {
            const label = context.dataset.label || "";
            const value = context.raw || 0;
            const dataPoint = context.label;

            if (dataPoint === "Buses") {
              return [
                `Total: ${value}`,
                `Active: ${activeBuses}`,
                `Inactive: ${inactiveBuses}`,
                `  • Idle: ${fleetStatus.idleBuses}`,
                `  • Breakdown: ${fleetStatus.breakdownBuses}`,
              ];
            }
            return `${label}: ${value}`;
          },
        },
        backgroundColor: "#1F2937",
        titleColor: "#FFFFFF",
        titleFont: { size: 14, weight: "bold" },
        bodyColor: "#E5E7EB",
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      },
    },
  };

  const systemChartData = {
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
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  // Fleet Status Cards
  const fleetCards = [
    {
      label: "Total Buses",
      value: fleetStatus.totalBuses,
      color: "text-blue-600",
      bg: "bg-gradient-to-br from-blue-50 to-blue-100",
      icon: <FiTruck className="text-blue-500" size={24} />,
      description: "Total fleet size",
    },
    {
      label: "Running Buses",
      value: fleetStatus.runningBuses,
      color: "text-emerald-600",
      bg: "bg-gradient-to-br from-emerald-50 to-emerald-100",
      icon: <FiPlay className="text-emerald-500" size={24} />,
      description: "Currently operating",
    },
    {
      label: "Idle Buses",
      value: fleetStatus.idleBuses,
      color: "text-amber-600",
      bg: "bg-gradient-to-br from-amber-50 to-amber-100",
      icon: <FiPause className="text-amber-500" size={24} />,
      description: "In depot",
    },
    {
      label: "Breakdown Buses",
      value: fleetStatus.breakdownBuses,
      color: "text-red-600",
      bg: "bg-gradient-to-br from-red-50 to-red-100",
      icon: <FiTool className="text-red-500" size={24} />,
      description: "Under maintenance",
    },
    {
      label: "Trips Running Now",
      value: fleetStatus.tripsRunningNow,
      color: "text-violet-600",
      bg: "bg-gradient-to-br from-violet-50 to-violet-100",
      icon: <FiActivity className="text-violet-500" size={24} />,
      description: "Active trips",
    },
    {
      label: "Trips Completed Today",
      value: fleetStatus.tripsCompletedToday,
      color: "text-indigo-600",
      bg: "bg-gradient-to-br from-indigo-50 to-indigo-100",
      icon: <FiCheckCircle className="text-indigo-500" size={24} />,
      description: "Today's completed",
    },
  ];

  // Revenue Cards
  const revenueCards = [
    {
      label: "Collection Today",
      value: formatCurrency(revenueStats.collectionToday),
      color: "text-emerald-600",
      bg: "bg-gradient-to-br from-emerald-50 to-emerald-100",
      icon: <FiDollarSign className="text-emerald-500" size={24} />,
    },
    {
      label: "Collection This Week",
      value: formatCurrency(revenueStats.collectionThisWeek),
      color: "text-blue-600",
      bg: "bg-gradient-to-br from-blue-50 to-blue-100",
      icon: <FiCalendar className="text-blue-500" size={24} />,
    },
    {
      label: "Collection This Month",
      value: formatCurrency(revenueStats.collectionThisMonth),
      color: "text-violet-600",
      bg: "bg-gradient-to-br from-violet-50 to-violet-100",
      icon: <FiTrendingUp className="text-violet-500" size={24} />,
    },
    {
      label: "Ticket Revenue",
      value: formatCurrency(revenueStats.ticketRevenue),
      color: "text-orange-600",
      bg: "bg-gradient-to-br from-orange-50 to-orange-100",
      icon: <FiDollarSign className="text-orange-500" size={24} />,
    },
    {
      label: "Pass Revenue",
      value: formatCurrency(revenueStats.passRevenue),
      color: "text-purple-600",
      bg: "bg-gradient-to-br from-purple-50 to-purple-100",
      icon: <FiTrendingUp className="text-purple-500" size={24} />,
    },
  ];

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans">
        {/* Header with Refresh */}
        <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Real-time fleet monitoring & analytics
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#0066CC] text-white rounded-xl shadow-lg shadow-blue-200 hover:bg-[#0052A3] transition-all disabled:opacity-50 active:scale-95"
          >
            <FiRefreshCw
              className={`${refreshing ? "animate-spin" : ""} text-white`}
            />
            <span className="text-sm font-semibold">Refresh</span>
          </button>
        </div>

        {/* Fleet Status Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FiTruck className="text-blue-600 text-xl" />
              <h2 className="text-xl font-bold text-gray-800">
                Fleet Status Dashboard
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <FiWifi className="text-green-500" />
              <span>Live Data • Real-time updates</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {fleetCards.map((card, index) => (
              <div
                key={index}
                className={`rounded-[24px] border border-[#E9ECEF] shadow-[0_10px_30px_rgba(0,0,0,0.04)] p-6 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:scale-[1.02] ${card.bg}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500 tracking-wider">
                      {card.label}
                    </p>
                    {loading ? (
                      <Skeleton width={80} height={40} className="mt-2" />
                    ) : (
                      <span
                        className={`text-3xl font-bold ${card.color} mt-2 block`}
                      >
                        {card.value}
                      </span>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      {card.description}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-white shadow-xs">
                    {card.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Dashboard Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <FiDollarSign className="text-emerald-600 text-xl" />
            <h2 className="text-xl font-bold text-gray-800">
              Revenue Dashboard
            </h2>
          </div>

          {/* Revenue Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
            {revenueCards.map((card, index) => (
              <div
                key={index}
                className={`rounded-[24px] border border-[#E9ECEF] shadow-[0_10px_30px_rgba(0,0,0,0.04)] p-5 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] ${card.bg}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 tracking-wider">
                      {card.label}
                    </p>
                    {loading ? (
                      <Skeleton width={100} height={40} className="mt-2" />
                    ) : (
                      <span
                        className={`text-xl font-bold ${card.color} mt-2 block`}
                      >
                        {card.value}
                      </span>
                    )}
                  </div>
                  <div className="p-2 rounded-lg bg-white shadow-xs">
                    {card.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Overview Chart */}
        <div className="bg-white rounded-[24px] shadow-[0_20px_40px_rgba(0,0,0,0.06)] p-6 sm:p-8 border border-[#E9ECEF]">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            System Overview
          </h2>
          <div className="h-[300px]">
            {loading ? (
              <Skeleton height={300} className="rounded-lg" />
            ) : (
              <Bar options={systemChartOptions} data={systemChartData} />
            )}
          </div>
          {/* Tooltip instruction hint */}
          <div className="mt-3 text-center text-xs text-gray-400">
            💡 Hover over the "Buses" bar to see active vs inactive breakdown
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
