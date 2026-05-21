import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { toast } from "react-toastify";
import { FiTruck, FiTrendingUp, FiPlay, FiPause, FiTool, FiCheckCircle, FiDollarSign, FiCalendar, FiRefreshCw, FiActivity, FiWifi } from "react-icons/fi";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { io } from "socket.io-client";
import axiosInstance from "../../utils/axiosInstance";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const [stats, setStats] = useState({ buses: 0, routes: 0, posDevices: 0, users: 0 });
  const [fleetStatus, setFleetStatus] = useState({ totalBuses: 0, runningBuses: 0, idleBuses: 0, breakdownBuses: 0, tripsRunningNow: 0, tripsCompletedToday: 0 });
  const [revenueStats, setRevenueStats] = useState({ collectionToday: 0, collectionThisWeek: 0, collectionThisMonth: 0, ticketRevenue: 0, passRevenue: 0 });

  useEffect(() => {
    const socket = io(process.env.REACT_APP_API_URL);
    socket.on("dashboard:update", (data) => {
      setFleetStatus(data.fleet);
      setRevenueStats(data.revenue);
      setStats(data.stats);
      setLastUpdated(new Date());
    });
    return () => socket.disconnect();
  }, []);

  const formatCurrency = (val) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

  const chartData = {
    labels: ["Buses", "Routes", "POS Devices", "Users"],
    datasets: [{
      label: "Count",
      data: [stats.buses, stats.routes, stats.posDevices, stats.users],
      backgroundColor: ["#4f46e5", "#10b981", "#8b5cf6", "#f59e0b"],
      borderRadius: 12,
      barThickness: 50,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { tooltip: { backgroundColor: '#1e293b', padding: 12, cornerRadius: 8 } },
    scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: '#f1f5f9' } } }
  };

  const StatCard = ({ title, value, icon: Icon, color, desc }) => (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-extrabold text-slate-800 mt-2">{loading ? <Skeleton width={60} /> : value}</h3>
          {desc && <p className="text-slate-400 text-xs mt-1">{desc}</p>}
        </div>
        <div className={`p-3 rounded-2xl bg-slate-50 text-${color}-500 group-hover:scale-110 transition-transform`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Dashboard</h1>
            <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Monitoring • Updated {lastUpdated.toLocaleTimeString()}
            </div>
          </div>
          <button 
            onClick={() => setRefreshing(true)} 
            className="bg-slate-900 text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-slate-800 transition-colors"
          >
            <FiRefreshCw className={refreshing ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Buses" value={fleetStatus.totalBuses} icon={FiTruck} color="blue" />
          <StatCard title="Active Trips" value={fleetStatus.tripsRunningNow} icon={FiActivity} color="emerald" />
          <StatCard title="Today's Revenue" value={formatCurrency(revenueStats.collectionToday)} icon={FiDollarSign} color="violet" />
          <StatCard title="Breakdowns" value={fleetStatus.breakdownBuses} icon={FiTool} color="red" />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-6">System Overview</h2>
            <div className="h-[350px]">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>

          <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-200">
            <h2 className="text-2xl font-bold mb-6">Quick Stats</h2>
            <div className="space-y-6">
              {[
                { label: "This Week", val: formatCurrency(revenueStats.collectionThisWeek) },
                { label: "This Month", val: formatCurrency(revenueStats.collectionThisMonth) },
                { label: "Completed Trips", val: fleetStatus.tripsCompletedToday },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center border-b border-indigo-500 pb-4">
                  <span className="text-indigo-200">{item.label}</span>
                  <span className="font-bold text-lg">{item.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
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
