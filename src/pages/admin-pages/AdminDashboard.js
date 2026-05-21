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
// FULL PREMIUM DYNAMIC ADMIN DASHBOARD
// SAME LIGHT THEME AS YOUR IMAGE
// ADDITIONS:
// ✅ Hover Graphs
// ✅ Animated Cards
// ✅ Dynamic UI
// ✅ Premium Glassmorphism
// ✅ Live Effects
// ✅ Better Charts
// ✅ Beautiful Layout
// ✅ Enterprise Dashboard Feel

import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";

import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import {
  FiTruck,
  FiPlay,
  FiPause,
  FiTool,
  FiDollarSign,
  FiTrendingUp,
  FiActivity,
  FiWifi,
  FiRefreshCw,
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

  const [hoveredCard, setHoveredCard] = useState(null);

  const [lastUpdated, setLastUpdated] = useState(new Date());

  const [liveRevenueData, setLiveRevenueData] = useState([]);

  useEffect(() => {
    socket = io(process.env.REACT_APP_API_URL);

    socket.on("dashboard:update", (data) => {
      setDashboard(data);

      setLiveRevenueData((prev) => [
        ...prev.slice(-9),
        {
          value: data.revenue.collectionToday,
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
      const res = await axiosInstance.get(
        "/api/dashboard/analytics",
      );

      setDashboard(res.data);

      setLiveRevenueData([
        {
          value: res.data.revenue.collectionToday,
        },
      ]);

      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  };

  const cards = [
    {
      id: 1,
      title: "Total Buses",
      value: dashboard.fleet.totalBuses || 0,
      subtitle: "Total fleet size",
      icon: <FiTruck />,
      bg: "from-blue-50 to-blue-100",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600",
      textColor: "text-blue-700",
      graphColor: "#2563EB",
    },
    {
      id: 2,
      title: "Running Buses",
      value: dashboard.fleet.runningBuses || 0,
      subtitle: "Currently operating",
      icon: <FiPlay />,
      bg: "from-emerald-50 to-emerald-100",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
      textColor: "text-emerald-700",
      graphColor: "#10B981",
    },
    {
      id: 3,
      title: "Idle Buses",
      value: dashboard.fleet.idleBuses || 0,
      subtitle: "Waiting in depot",
      icon: <FiPause />,
      bg: "from-amber-50 to-amber-100",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-600",
      textColor: "text-amber-700",
      graphColor: "#F59E0B",
    },
    {
      id: 4,
      title: "Breakdown Buses",
      value: dashboard.fleet.breakdownBuses || 0,
      subtitle: "Under maintenance",
      icon: <FiTool />,
      bg: "from-red-50 to-red-100",
      iconBg: "bg-red-500/10",
      iconColor: "text-red-600",
      textColor: "text-red-700",
      graphColor: "#EF4444",
    },
    {
      id: 5,
      title: "Revenue Today",
      value:
        dashboard.revenue.collectionToday || 0,
      prefix: "₹",
      subtitle: "Today's collection",
      icon: <FiDollarSign />,
      bg: "from-violet-50 to-violet-100",
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-600",
      textColor: "text-violet-700",
      graphColor: "#8B5CF6",
    },
    {
      id: 6,
      title: "Trips Running",
      value:
        dashboard.fleet.tripsRunningNow || 0,
      subtitle: "Active trips",
      icon: <FiActivity />,
      bg: "from-cyan-50 to-cyan-100",
      iconBg: "bg-cyan-500/10",
      iconColor: "text-cyan-600",
      textColor: "text-cyan-700",
      graphColor: "#06B6D4",
    },
  ];

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#F4F7FB] rounded-[30px] p-6">

        {/* HEADER */}

        <div className="flex justify-between items-center flex-wrap gap-5 mb-10">

          <div>
            <h1 className="text-4xl font-bold text-[#111827] tracking-tight">
              Admin Dashboard
            </h1>

            <p className="text-gray-500 mt-2">
              Real-time fleet monitoring & analytics
            </p>

            <div className="flex items-center gap-2 mt-3">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>

              <span className="text-sm text-green-600 font-medium">
                Live System Active
              </span>
            </div>
          </div>

          <button
            onClick={fetchInitialData}
            className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] transition-all duration-300 text-white px-6 py-3 rounded-2xl shadow-lg shadow-blue-200"
          >
            <FiRefreshCw />
            Refresh
          </button>
        </div>

        {/* LIVE STATUS BAR */}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">

          <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">
                  Socket Status
                </p>

                <h2 className="text-xl font-bold text-green-600 mt-1">
                  Connected
                </h2>
              </div>

              <FiWifi className="text-3xl text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">
                  Active Routes
                </p>

                <h2 className="text-xl font-bold text-blue-600 mt-1">
                  {dashboard.stats.routes || 0}
                </h2>
              </div>

              <FiTrendingUp className="text-3xl text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">
                  POS Devices
                </p>

                <h2 className="text-xl font-bold text-violet-600 mt-1">
                  {dashboard.stats.posDevices || 0}
                </h2>
              </div>

              <FiActivity className="text-3xl text-violet-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">
                  Users
                </p>

                <h2 className="text-xl font-bold text-orange-600 mt-1">
                  {dashboard.stats.users || 0}
                </h2>
              </div>

              <FiTruck className="text-3xl text-orange-500" />
            </div>
          </div>
        </div>

        {/* DYNAMIC CARDS */}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

          {cards.map((card) => (

            <motion.div
              key={card.id}
              layout
              whileHover={{
                y: -8,
                scale: 1.02,
              }}
              transition={{
                duration: 0.3,
              }}
              onMouseEnter={() =>
                setHoveredCard(card.id)
              }
              onMouseLeave={() =>
                setHoveredCard(null)
              }
              className={`relative overflow-hidden rounded-[28px] border border-[#E5E7EB] bg-gradient-to-br ${card.bg} shadow-[0_10px_40px_rgba(0,0,0,0.04)] p-6`}
            >

              {/* Glow Effect */}

              <div className="absolute top-0 right-0 w-40 h-40 bg-white/40 blur-3xl rounded-full"></div>

              {/* TOP */}

              <div className="flex justify-between items-start relative z-10">

                <div>

                  <p className="text-sm font-medium text-gray-500 tracking-wide">
                    {card.title}
                  </p>

                  <div
                    className={`mt-3 text-4xl font-bold ${card.textColor}`}
                  >
                    {card.prefix}

                    <CountUp
                      end={card.value}
                      duration={2}
                      separator=","
                    />
                  </div>

                  <p className="text-xs text-gray-400 mt-2">
                    {card.subtitle}
                  </p>
                </div>

                <div
                  className={`w-14 h-14 rounded-2xl ${card.iconBg} flex items-center justify-center text-2xl ${card.iconColor}`}
                >
                  {card.icon}
                </div>
              </div>

              {/* LIVE BAR */}

              <div className="mt-5 h-2 bg-white/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(
                      card.value,
                      100,
                    )}%`,
                  }}
                  transition={{
                    duration: 1.5,
                  }}
                  className="h-full bg-white"
                />
              </div>

              {/* HOVER GRAPH */}

              <AnimatePresence>

                {hoveredCard === card.id && (

                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 20,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: 20,
                    }}
                    transition={{
                      duration: 0.3,
                    }}
                    className="mt-6 h-[120px]"
                  >

                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >
                      <AreaChart
                        data={liveRevenueData}
                      >
                        <defs>
                          <linearGradient
                            id={`gradient-${card.id}`}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor={
                                card.graphColor
                              }
                              stopOpacity={0.8}
                            />

                            <stop
                              offset="95%"
                              stopColor={
                                card.graphColor
                              }
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>

                        <Tooltip />

                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke={
                            card.graphColor
                          }
                          fillOpacity={1}
                          fill={`url(#gradient-${card.id})`}
                          strokeWidth={3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>

                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          ))}
        </div>

        {/* BIG LIVE ANALYTICS */}

        <div className="mt-10 bg-white rounded-[32px] border border-[#E5E7EB] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">

          <div className="flex justify-between items-center mb-8">

            <div>
              <h2 className="text-2xl font-bold text-[#111827]">
                Revenue Analytics
              </h2>

              <p className="text-gray-500 mt-1">
                Live revenue growth tracking
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>

              <span className="text-sm text-green-600 font-medium">
                LIVE
              </span>
            </div>
          </div>

          <div className="h-[380px]">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <AreaChart data={liveRevenueData}>

                <defs>
                  <linearGradient
                    id="mainGraph"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#2563EB"
                      stopOpacity={0.5}
                    />

                    <stop
                      offset="95%"
                      stopColor="#2563EB"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#2563EB"
                  fillOpacity={1}
                  fill="url(#mainGraph)"
                  strokeWidth={4}
                />
              </AreaChart>
            </ResponsiveContainer>

          </div>
        </div>

        {/* FOOTER */}

        <div className="mt-8 text-center text-gray-400 text-sm">
          Last Updated :
          {" "}
          {lastUpdated.toLocaleTimeString()}
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;