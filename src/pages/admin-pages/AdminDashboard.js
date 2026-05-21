// import React, { useEffect, useState } from "react";
// import AdminLayout from "./AdminLayout";
// import { toast } from "react-toastify";
// import {
//   FiTruck,
//   FiTrendingUp,
//   FiPlay,
//   FiPause,
//   FiTool,
//   FiCheckCircle,
//   FiDollarSign,
//   FiCalendar,
//   FiRefreshCw,
//   FiActivity,
//   FiWifi,
// } from "react-icons/fi";
// import { Bar } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";
// import Skeleton from "react-loading-skeleton";
// import "react-loading-skeleton/dist/skeleton.css";
// import { io } from "socket.io-client";
// import axiosInstance from "../../utils/axiosInstance";
// import { useNavigate } from "react-router-dom";

// let socket;

// // Register ChartJS components
// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
// );

// const AdminDashboard = () => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [lastUpdated, setLastUpdated] = useState(new Date());

//   const [stats, setStats] = useState({
//     buses: 0,
//     routes: 0,
//     posDevices: 0,
//     users: 0,
//   });

//   const [fleetStatus, setFleetStatus] = useState({
//     totalBuses: 0,
//     runningBuses: 0,
//     idleBuses: 0,
//     breakdownBuses: 0,
//     tripsRunningNow: 0,
//     tripsCompletedToday: 0,
//   });

//   const [revenueStats, setRevenueStats] = useState({
//     collectionToday: 0,
//     collectionThisWeek: 0,
//     collectionThisMonth: 0,
//     ticketRevenue: 0,
//     passRevenue: 0,
//   });

//   // Socket Real-time connection
//   useEffect(() => {
//     socket = io(process.env.REACT_APP_API_URL);

//     socket.on("connect", () => {
//       console.log("✅ Connected:", socket.id);
//     });

//     socket.on("dashboard:update", (data) => {
//       console.log("🔥 LIVE DATA:", data);

//       setFleetStatus(data.fleet);
//       setRevenueStats(data.revenue);
//       setStats(data.stats);

//       setLoading(false);
//       setRefreshing(false);
//       setLastUpdated(new Date());
//     });

//     socket.on("dashboard:error", (err) => {
//       console.error("❌ Socket Error:", err);
//       toast.error(err.message || "Real-time update failed");
//     });

//     // Initial fetch to avoid 10s delay
//     const fetchInitialData = async () => {
//       try {
//         const response = await axiosInstance.get("/api/dashboard/analytics");
//         const data = response.data;
//         setFleetStatus(data.fleet);
//         setRevenueStats(data.revenue);
//         setStats(data.stats);
//         setLoading(false);
//       } catch (err) {
//         console.error("❌ Initial Fetch Error:", err);
//         // Don't toast here as socket might eventually pick up
//       }
//     };

//     fetchInitialData();

//     return () => socket.disconnect();
//   }, []);

//   // Manual refresh (UI effect only)
//   const handleManualRefresh = () => {
//     setRefreshing(true);
//     toast.info("Refreshing dashboard data...");
//     setTimeout(() => setRefreshing(false), 1000);
//   };

//   // Format currency
//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat("en-IN", {
//       style: "currency",
//       currency: "INR",
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0,
//     }).format(amount);
//   };

//   // Calculate active and inactive buses
//   const activeBuses = fleetStatus.runningBuses;
//   const inactiveBuses = fleetStatus.idleBuses + fleetStatus.breakdownBuses;

//   // Custom tooltip for chart
//   const customTooltip = (context) => {
//     const label = context.tooltip.label || "";
//     const value = context.tooltip.raw || 0;

//     if (label === "Buses") {
//       return {
//         title: ["Buses Breakdown"],
//         beforeBody: [`Total: ${value}`],
//         afterBody: [
//           `Active: ${activeBuses}`,
//           `Inactive: ${inactiveBuses}`,
//           `  • Idle: ${fleetStatus.idleBuses}`,
//           `  • Breakdown: ${fleetStatus.breakdownBuses}`,
//         ],
//       };
//     }
//     return null;
//   };

//   const systemChartOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       tooltip: {
//         callbacks: {
//           title: (tooltipItems) => {
//             const label = tooltipItems[0].label;
//             if (label === "Buses") {
//               return "Buses Breakdown";
//             }
//             return label;
//           },
//           label: (context) => {
//             const label = context.dataset.label || "";
//             const value = context.raw || 0;
//             const dataPoint = context.label;

//             if (dataPoint === "Buses") {
//               return [
//                 `Total: ${value}`,
//                 `Active: ${activeBuses}`,
//                 `Inactive: ${inactiveBuses}`,
//                 `  • Idle: ${fleetStatus.idleBuses}`,
//                 `  • Breakdown: ${fleetStatus.breakdownBuses}`,
//               ];
//             }
//             return `${label}: ${value}`;
//           },
//         },
//         backgroundColor: "#1F2937",
//         titleColor: "#FFFFFF",
//         titleFont: { size: 14, weight: "bold" },
//         bodyColor: "#E5E7EB",
//         bodyFont: { size: 12 },
//         padding: 12,
//         cornerRadius: 8,
//         displayColors: false,
//       },
//     },
//   };

//   const systemChartData = {
//     labels: ["Buses", "Routes", "POS Devices", "Users"],
//     datasets: [
//       {
//         label: "Count",
//         data: [stats.buses, stats.routes, stats.posDevices, stats.users],
//         backgroundColor: [
//           "rgba(79, 70, 229, 0.8)",
//           "rgba(16, 185, 129, 0.8)",
//           "rgba(139, 92, 246, 0.8)",
//           "rgba(245, 158, 11, 0.8)",
//         ],
//         borderRadius: 8,
//         borderSkipped: false,
//       },
//     ],
//   };

//   // Fleet Status Cards
//   const fleetCards = [
//     {
//       label: "Total Buses",
//       value: fleetStatus.totalBuses,
//       color: "text-blue-600",
//       bg: "bg-gradient-to-br from-blue-50 to-blue-100",
//       icon: <FiTruck className="text-blue-500" size={24} />,
//       description: "Total fleet size",
//     },
//     {
//       label: "Running Buses",
//       value: fleetStatus.runningBuses,
//       color: "text-emerald-600",
//       bg: "bg-gradient-to-br from-emerald-50 to-emerald-100",
//       icon: <FiPlay className="text-emerald-500" size={24} />,
//       description: "Currently operating",
//     },
//     {
//       label: "Idle Buses",
//       value: fleetStatus.idleBuses,
//       color: "text-amber-600",
//       bg: "bg-gradient-to-br from-amber-50 to-amber-100",
//       icon: <FiPause className="text-amber-500" size={24} />,
//       description: "In depot",
//     },
//     {
//       label: "Breakdown Buses",
//       value: fleetStatus.breakdownBuses,
//       color: "text-red-600",
//       bg: "bg-gradient-to-br from-red-50 to-red-100",
//       icon: <FiTool className="text-red-500" size={24} />,
//       description: "Under maintenance",
//     },
//     {
//       label: "Trips Running Now",
//       value: fleetStatus.tripsRunningNow,
//       color: "text-violet-600",
//       bg: "bg-gradient-to-br from-violet-50 to-violet-100",
//       icon: <FiActivity className="text-violet-500" size={24} />,
//       description: "Active trips",
//     },
//     {
//       label: "Trips Completed Today",
//       value: fleetStatus.tripsCompletedToday,
//       color: "text-indigo-600",
//       bg: "bg-gradient-to-br from-indigo-50 to-indigo-100",
//       icon: <FiCheckCircle className="text-indigo-500" size={24} />,
//       description: "Today's completed",
//     },
//   ];

//   // Revenue Cards
//   const revenueCards = [
//     {
//       label: "Collection Today",
//       value: formatCurrency(revenueStats.collectionToday),
//       color: "text-emerald-600",
//       bg: "bg-gradient-to-br from-emerald-50 to-emerald-100",
//       icon: <FiDollarSign className="text-emerald-500" size={24} />,
//     },
//     {
//       label: "Collection This Week",
//       value: formatCurrency(revenueStats.collectionThisWeek),
//       color: "text-blue-600",
//       bg: "bg-gradient-to-br from-blue-50 to-blue-100",
//       icon: <FiCalendar className="text-blue-500" size={24} />,
//     },
//     {
//       label: "Collection This Month",
//       value: formatCurrency(revenueStats.collectionThisMonth),
//       color: "text-violet-600",
//       bg: "bg-gradient-to-br from-violet-50 to-violet-100",
//       icon: <FiTrendingUp className="text-violet-500" size={24} />,
//     },
//     {
//       label: "Ticket Revenue",
//       value: formatCurrency(revenueStats.ticketRevenue),
//       color: "text-orange-600",
//       bg: "bg-gradient-to-br from-orange-50 to-orange-100",
//       icon: <FiDollarSign className="text-orange-500" size={24} />,
//     },
//     {
//       label: "Pass Revenue",
//       value: formatCurrency(revenueStats.passRevenue),
//       color: "text-purple-600",
//       bg: "bg-gradient-to-br from-purple-50 to-purple-100",
//       icon: <FiTrendingUp className="text-purple-500" size={24} />,
//     },
//   ];

//   return (
//     <AdminLayout>
//       <div className="p-4 sm:p-6 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans">
//         {/* Header with Refresh */}
//         <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
//           <div>
//             <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
//               Admin Dashboard
//             </h1>
//             <p className="text-gray-500 mt-1 text-sm">
//               Real-time fleet monitoring & analytics
//             </p>
//             <p className="text-xs text-gray-400 mt-1">
//               Last updated: {lastUpdated.toLocaleTimeString()}
//             </p>
//           </div>
//           <button
//             onClick={handleManualRefresh}
//             disabled={refreshing}
//             className="flex items-center gap-2 px-6 py-2.5 bg-[#0066CC] text-white rounded-xl shadow-lg shadow-blue-200 hover:bg-[#0052A3] transition-all disabled:opacity-50 active:scale-95"
//           >
//             <FiRefreshCw
//               className={`${refreshing ? "animate-spin" : ""} text-white`}
//             />
//             <span className="text-sm font-semibold">Refresh</span>
//           </button>
//         </div>

//         {/* Fleet Status Section */}
//         <div className="mb-8">
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center gap-2">
//               <FiTruck className="text-blue-600 text-xl" />
//               <h2 className="text-xl font-bold text-gray-800">
//                 Fleet Status Dashboard
//               </h2>
//             </div>
//             <div className="flex items-center gap-2 text-xs text-gray-500">
//               <FiWifi className="text-green-500" />
//               <span>Live Data • Real-time updates</span>
//             </div>
//           </div>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
//             {fleetCards.map((card, index) => (
//               <div
//                 key={index}
//                 className={`rounded-[24px] border border-[#E9ECEF] shadow-[0_10px_30px_rgba(0,0,0,0.04)] p-6 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:scale-[1.02] ${card.bg}`}
//               >
//                 <div className="flex justify-between items-start">
//                   <div>
//                     <p className="text-sm font-medium text-gray-500 tracking-wider">
//                       {card.label}
//                     </p>
//                     {loading ? (
//                       <Skeleton width={80} height={40} className="mt-2" />
//                     ) : (
//                       <span
//                         className={`text-3xl font-bold ${card.color} mt-2 block`}
//                       >
//                         {card.value}
//                       </span>
//                     )}
//                     <p className="text-xs text-gray-400 mt-2">
//                       {card.description}
//                     </p>
//                   </div>
//                   <div className="p-2 rounded-lg bg-white shadow-xs">
//                     {card.icon}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Revenue Dashboard Section */}
//         <div className="mb-8">
//           <div className="flex items-center gap-2 mb-4">
//             <FiDollarSign className="text-emerald-600 text-xl" />
//             <h2 className="text-xl font-bold text-gray-800">
//               Revenue Dashboard
//             </h2>
//           </div>

//           {/* Revenue Cards */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
//             {revenueCards.map((card, index) => (
//               <div
//                 key={index}
//                 className={`rounded-[24px] border border-[#E9ECEF] shadow-[0_10px_30px_rgba(0,0,0,0.04)] p-5 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] ${card.bg}`}
//               >
//                 <div className="flex justify-between items-start">
//                   <div className="flex-1">
//                     <p className="text-sm font-medium text-gray-500 tracking-wider">
//                       {card.label}
//                     </p>
//                     {loading ? (
//                       <Skeleton width={100} height={40} className="mt-2" />
//                     ) : (
//                       <span
//                         className={`text-xl font-bold ${card.color} mt-2 block`}
//                       >
//                         {card.value}
//                       </span>
//                     )}
//                   </div>
//                   <div className="p-2 rounded-lg bg-white shadow-xs">
//                     {card.icon}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* System Overview Chart */}
//         <div className="bg-white rounded-[24px] shadow-[0_20px_40px_rgba(0,0,0,0.06)] p-6 sm:p-8 border border-[#E9ECEF]">
//           <h2 className="text-lg font-semibold text-gray-800 mb-4">
//             System Overview
//           </h2>
//           <div className="h-[300px]">
//             {loading ? (
//               <Skeleton height={300} className="rounded-lg" />
//             ) : (
//               <Bar options={systemChartOptions} data={systemChartData} />
//             )}
//           </div>
//           {/* Tooltip instruction hint */}
//           <div className="mt-3 text-center text-xs text-gray-400">
//             💡 Hover over the "Buses" bar to see active vs inactive breakdown
//           </div>
//         </div>
//       </div>
//     </AdminLayout>
//   );
// };

// export default AdminDashboard;
// AdminDashboard.jsx

import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  FiTruck,
  FiActivity,
  FiDollarSign,
  FiWifi,
  FiAlertTriangle,
  FiRefreshCw,
  FiMapPin,
} from "react-icons/fi";

import { io } from "socket.io-client";
import axiosInstance from "../../utils/axiosInstance";

let socket;

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);

  const [dashboard, setDashboard] = useState({
    fleet: {},
    revenue: {},
    stats: {},
  });

  const [lastUpdated, setLastUpdated] = useState(new Date());

  const [revenueData, setRevenueData] = useState([]);

  useEffect(() => {
    socket = io(process.env.REACT_APP_API_URL);

    socket.on("connect", () => {
      console.log("✅ Socket Connected");
    });

    socket.on("dashboard:update", (data) => {
      setDashboard(data);

      setRevenueData((prev) => [
        ...prev.slice(-6),
        {
          time: new Date().toLocaleTimeString(),
          revenue: data.revenue.collectionToday,
        },
      ]);

      setLastUpdated(new Date());
      setLoading(false);
    });

    fetchInitialData();

    return () => socket.disconnect();
  }, []);

  const fetchInitialData = async () => {
    try {
      const res = await axiosInstance.get("/api/dashboard/analytics");

      setDashboard(res.data);

      setRevenueData([
        {
          time: new Date().toLocaleTimeString(),
          revenue: res.data.revenue.collectionToday,
        },
      ]);

      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  };

  const fleetEfficiency = dashboard.fleet.totalBuses
    ? (
        (dashboard.fleet.runningBuses /
          dashboard.fleet.totalBuses) *
        100
      ).toFixed(1)
    : 0;

  const cards = [
    {
      title: "Running Buses",
      value: dashboard.fleet.runningBuses || 0,
      icon: <FiTruck />,
      color: "from-cyan-500 to-blue-600",
    },
    {
      title: "Trips Running",
      value: dashboard.fleet.tripsRunningNow || 0,
      icon: <FiActivity />,
      color: "from-violet-500 to-purple-600",
    },
    {
      title: "Revenue Today",
      value: dashboard.revenue.collectionToday || 0,
      prefix: "₹",
      icon: <FiDollarSign />,
      color: "from-emerald-500 to-green-600",
    },
    {
      title: "GPS Online",
      value: fleetEfficiency,
      suffix: "%",
      icon: <FiWifi />,
      color: "from-orange-500 to-red-500",
    },
  ];

  const fleetData = [
    {
      name: "Running",
      value: dashboard.fleet.runningBuses || 0,
    },
    {
      name: "Idle",
      value: dashboard.fleet.idleBuses || 0,
    },
    {
      name: "Breakdown",
      value: dashboard.fleet.breakdownBuses || 0,
    },
  ];

  const COLORS = ["#06B6D4", "#EAB308", "#EF4444"];

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#081028] text-white p-6 rounded-[30px]">

        {/* HEADER */}

        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-wide">
              Transport Control Center
            </h1>

            <p className="text-gray-400 mt-2">
              Real-time fleet monitoring dashboard
            </p>

            <div className="flex items-center gap-2 mt-3">
              <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>

              <span className="text-sm text-green-400">
                LIVE SYSTEM ACTIVE
              </span>
            </div>
          </div>

          <button
            onClick={fetchInitialData}
            className="bg-cyan-500 hover:bg-cyan-600 transition px-5 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/30"
          >
            <FiRefreshCw />
            Refresh
          </button>
        </div>

        {/* KPI CARDS */}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {cards.map((card, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.03 }}
              className={`bg-gradient-to-br ${card.color} rounded-3xl p-6 shadow-2xl relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>

              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-white/70 mb-3">
                    {card.title}
                  </p>

                  <h2 className="text-4xl font-bold">
                    {card.prefix}

                    <CountUp
                      end={Number(card.value)}
                      duration={2}
                    />

                    {card.suffix}
                  </h2>
                </div>

                <div className="text-4xl text-white/80">
                  {card.icon}
                </div>
              </div>

              <div className="mt-5 h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(card.value, 100)}%`,
                  }}
                  transition={{ duration: 1.5 }}
                  className="h-full bg-white"
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* CHARTS */}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">

          {/* Revenue Chart */}

          <motion.div
            whileHover={{ scale: 1.01 }}
            className="xl:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
          >
            <div className="flex justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">
                  Revenue Analytics
                </h2>

                <p className="text-gray-400 text-sm mt-1">
                  Live revenue updates
                </p>
              </div>

              <div className="flex items-center gap-2 text-green-400">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-ping"></span>
                LIVE
              </div>
            </div>

            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#06B6D4"
                        stopOpacity={0.8}
                      />

                      <stop
                        offset="95%"
                        stopColor="#06B6D4"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#1E293B"
                  />

                  <XAxis dataKey="time" stroke="#94A3B8" />

                  <YAxis stroke="#94A3B8" />

                  <Tooltip />

                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#06B6D4"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Fleet Status */}

          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
          >
            <h2 className="text-2xl font-bold mb-6">
              Fleet Health
            </h2>

            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fleetData}
                    dataKey="value"
                    outerRadius={100}
                    innerRadius={60}
                  >
                    {fleetData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index]}
                      />
                    ))}
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3 mt-4">
              {fleetData.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        background: COLORS[index],
                      }}
                    ></div>

                    <span>{item.name}</span>
                  </div>

                  <span className="font-bold">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* LIVE STATUS */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-red-500/20 to-red-900/20 border border-red-500/20 rounded-3xl p-6"
          >
            <div className="flex justify-between">
              <div>
                <p className="text-red-300 mb-2">
                  Breakdown Buses
                </p>

                <h2 className="text-5xl font-bold">
                  {dashboard.fleet.breakdownBuses || 0}
                </h2>
              </div>

              <FiAlertTriangle className="text-5xl text-red-400" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-cyan-500/20 to-cyan-900/20 border border-cyan-500/20 rounded-3xl p-6"
          >
            <div className="flex justify-between">
              <div>
                <p className="text-cyan-300 mb-2">
                  Active Routes
                </p>

                <h2 className="text-5xl font-bold">
                  {dashboard.stats.routes || 0}
                </h2>
              </div>

              <FiMapPin className="text-5xl text-cyan-400" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-emerald-500/20 to-emerald-900/20 border border-emerald-500/20 rounded-3xl p-6"
          >
            <div className="flex justify-between">
              <div>
                <p className="text-emerald-300 mb-2">
                  Trips Completed
                </p>

                <h2 className="text-5xl font-bold">
                  {dashboard.fleet.tripsCompletedToday || 0}
                </h2>
              </div>

              <FiActivity className="text-5xl text-emerald-400" />
            </div>
          </motion.div>
        </div>

        {/* FOOTER */}

        <div className="mt-8 text-center text-gray-500 text-sm">
          Last updated:
          {" "}
          {lastUpdated.toLocaleTimeString()}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;