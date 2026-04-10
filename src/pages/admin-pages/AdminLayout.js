// import React from "react";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import {
//   FiLogOut,
//   FiHome,
//   FiMap,
//   FiUsers,
//   FiTruck,
//   FiCpu,
//   FiChevronDown,
//   FiChevronUp,
// } from "react-icons/fi";
// import { toast } from "react-toastify";
// import { useSelector, useDispatch } from "react-redux";
// import { logoutUser } from "../../slices/authSlice";

// const navItems = [
//   {
//     path: "/admin/dashboard",
//     label: "Dashboard",
//     icon: <FiHome className="text-lg" />,
//     exact: true,
//   },
//   {
//     path: "/admin/buses",
//     label: "Buses",
//     icon: <FiTruck className="text-lg" />,
//     submenu: [
//       { path: "/admin/buses", label: "Manage Buses" },
//       { path: "/admin/bus-pos-mapping", label: "POS Mapping" },
//       { path: "/admin/manage-bus-route-mapping", label: "Route Mapping" },
//     ],
//   },
//   {
//     path: "/admin/routes",
//     label: "Routes",
//     icon: <FiMap className="text-lg" />,
//     submenu: [
//       { path: "/admin/routes", label: "Manage Routes" },
//       { path: "/admin/live-tracking", label: "Live Tracking" },
//     ],
//   },
//   {
//     path: "/admin/pos-machines",
//     label: "POS Machines",
//     icon: <FiCpu className="text-lg" />,
//     exact: true,
//   },
//   {
//     path: "/admin/all-users",
//     label: "Users",
//     icon: <FiUsers className="text-lg" />,
//     exact: true,
//   },
// ];

// const AdminLayout = ({ children }) => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const { user, loading } = useSelector((state) => state.auth);
//   const [expandedMenus, setExpandedMenus] = React.useState({});

//   const toggleMenu = (label) => {
//     setExpandedMenus((prev) => ({
//       ...prev,
//       [label]: !prev[label],
//     }));
//   };

//   const handleLogout = async () => {
//     try {
//       await dispatch(logoutUser()).unwrap();
//       toast.success("Logged out successfully");
//       navigate("/login");
//     } catch (error) {
//       toast.error(error || "Logout failed");
//     }
//   };

//   const isActive = (path, exact = false) => {
//     return exact
//       ? location.pathname === path
//       : location.pathname.startsWith(path);
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-900">
//         <div className="animate-pulse flex space-x-4">
//           <div className="rounded-full bg-gray-700 h-12 w-12"></div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex min-h-screen bg-gray-100 text-gray-800 font-sans">
//       {/* Sidebar */}
//       <aside className="w-64 bg-gray-900 text-gray-200 flex flex-col p-0 sticky top-0 h-screen shadow-xl border-r border-gray-800">
//         {/* Logo and User Info */}
//         <div className="p-6 pb-4 mb-2 border-b border-gray-800">
//           <div className="flex items-center space-x-3">
//             <div className="bg-blue-600 text-white p-2 rounded-lg">
//               <FiHome className="text-xl" />
//             </div>
//             <h2 className="text-xl font-bold tracking-tight">Admin Panel</h2>
//           </div>
//           {user && (
//             <p className="text-sm mt-3 text-gray-400 font-medium">
//               Welcome back,{" "}
//               <span className="text-blue-400">
//                 {user.name || user.phone || "Admin"}
//               </span>
//             </p>
//           )}
//         </div>

//         {/* Navigation */}
//         <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
//           {navItems.map((item) => {
//             const hasSubmenu = item.submenu && item.submenu.length > 0;
//             const isItemActive = isActive(item.path, item.exact);
//             const isExpanded = expandedMenus[item.label] || isItemActive;

//             return (
//               <div key={item.path} className="space-y-1">
//                 <div
//                   onClick={() => (hasSubmenu ? toggleMenu(item.label) : null)}
//                   className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition duration-200 cursor-pointer ${
//                     isItemActive
//                       ? "bg-blue-900/50 text-blue-100 border-l-4 border-blue-500"
//                       : "text-gray-300 hover:bg-gray-800 hover:text-white"
//                   }`}
//                 >
//                   <Link
//                     to={item.path}
//                     className="flex items-center flex-1"
//                     onClick={(e) => hasSubmenu && e.preventDefault()}
//                   >
//                     <span className="mr-3">{item.icon}</span>
//                     <span>{item.label}</span>
//                   </Link>
//                   {hasSubmenu && (
//                     <span className="text-gray-400">
//                       {isExpanded ? (
//                         <FiChevronUp className="text-sm" />
//                       ) : (
//                         <FiChevronDown className="text-sm" />
//                       )}
//                     </span>
//                   )}
//                 </div>

//                 {hasSubmenu && isExpanded && (
//                   <div className="ml-8 mt-1 mb-2 space-y-1">
//                     {item.submenu.map((subItem) => (
//                       <Link
//                         key={subItem.path}
//                         to={subItem.path}
//                         className={`block px-3 py-2.5 text-sm rounded-lg transition duration-200 ${
//                           isActive(subItem.path, true)
//                             ? "bg-gray-800 text-blue-300 font-medium"
//                             : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
//                         }`}
//                       >
//                         {subItem.label}
//                       </Link>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </nav>

//         {/* Logout */}
//         <div className="p-4 border-t border-gray-800 mt-auto">
//           <button
//             onClick={handleLogout}
//             className="flex items-center w-full px-4 py-2.5 text-red-300 hover:text-white text-sm font-medium transition rounded-lg hover:bg-red-900/30"
//           >
//             <FiLogOut className="mr-3" />
//             Logout
//           </button>
//         </div>
//       </aside>

//       {/* Main Content - Simplified without header */}
//       <main className="flex-1 flex flex-col overflow-hidden bg-gray-100">
//         {/* Direct content without title header */}
//         <section className="flex-1 overflow-y-auto p-6 bg-gray-100">
//           <div className="bg-white rounded-xl shadow-xs p-6 min-h-[calc(100vh-120px)] border border-gray-200">
//             {children}
//           </div>
//         </section>
//       </main>
//     </div>
//   );
// };

// export default AdminLayout;

import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiLogOut,
  FiHome,
  FiMap,
  FiUsers,
  FiTruck,
  FiCpu,
  FiUserCheck,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../../slices/authSlice";
// import ConductorsPage from "./Conductors.js"; // Import the ConductorsPage

// Navigation items
const navItems = [
  {
    path: "/admin/dashboard",
    label: "Dashboard",
    icon: <FiHome className="text-lg" />,
    exact: true,
  },
  {
    path: "/admin/buses",
    label: "Buses",
    icon: <FiTruck className="text-lg" />,
    submenu: [
      { path: "/admin/buses", label: "Manage Buses" },
      { path: "/admin/bus-pos-mapping", label: "POS Mapping" },
      { path: "/admin/manage-bus-route-mapping", label: "Route Mapping" },
    ],
  },
  {
    path: "/admin/routes",
    label: "Routes",
    icon: <FiMap className="text-lg" />,
    submenu: [
      { path: "/admin/routes", label: "Manage Routes" },
      { path: "/admin/live-tracking", label: "Live Tracking" },
    ],
  },
  {
    path: "/admin/pos-machines",
    label: "POS Machines",
    icon: <FiCpu className="text-lg" />,
    exact: true,
  },
  {
    path: "/admin/all-users",
    label: "Users",
    icon: <FiUsers className="text-lg" />,
    exact: true,
  },
  {
    label: "Conductors",
    icon: <FiUserCheck className="text-lg" />,
    submenu: [
      {
        path: "/admin/conductors",
        label:"manage conductors",
      },
      {
        path: "/admin/conductor-report",
        label: "Conductor Report",
      },
      {
        path: "/admin/conductor-bus-assign",
        label: "Conductor Bus Assign",
      },
    ],
    exact: true,
  },
  // {
  //   path: "/admin/stop-price",
  //   label: "Stop Prices",
  //   icon: <FiMap className="text-lg" />, // you can change to another icon
  //   exact: true,
  // },

  {
    path: "/admin/passes",
    label: "Passes",
    icon: <FiMap className="text-lg" />, // you can change to another icon
    exact: true,
  },
  {
    path: "/admin/farecharts",
    label: "Fare Charts",
    icon: <FiMap className="text-lg" />,
    exact: true,
  },
  {
  label: "Settings",
  icon: <FiUsers className="text-lg" />,
  submenu: [
    {
      path: "/admin/change-password",
      label: "Change Password",
      icon: <FileSystem className="text-lg" />,
    },
  ],
}
];

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, loading } = useSelector((state) => state.auth);
  const [expandedMenus, setExpandedMenus] = React.useState({});

  const toggleMenu = (label) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      toast.error(error || "Logout failed");
    }
  };

  const isActive = (path, exact = false) => {
    return exact
      ? location.pathname === path
      : location.pathname.startsWith(path);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-700 h-12 w-12"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-800 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-gray-200 flex flex-col p-0 sticky top-0 h-screen shadow-xl border-r border-gray-800">
        {/* Logo and User Info */}
        <div className="p-6 pb-4 mb-2 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <FiHome className="text-xl" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Admin Panel</h2>
          </div>
          {user && (
            <p className="text-sm mt-3 text-gray-400 font-medium">
              Welcome back,{" "}
              <span className="text-blue-400">
                {user.name || user.phone || "Admin"}
              </span>
            </p>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isItemActive = isActive(item.path, item.exact);
            const isExpanded = expandedMenus[item.label] || isItemActive;

            return (
              <div key={item.path} className="space-y-1">
                <div
                  onClick={() => (hasSubmenu ? toggleMenu(item.label) : null)}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition duration-200 cursor-pointer ${
                    isItemActive
                      ? "bg-blue-900/50 text-blue-100 border-l-4 border-blue-500"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <Link
                    to={item.path}
                    className="flex items-center flex-1"
                    onClick={(e) => hasSubmenu && e.preventDefault()}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                  {hasSubmenu && (
                    <span className="text-gray-400">
                      {isExpanded ? (
                        <FiChevronUp className="text-sm" />
                      ) : (
                        <FiChevronDown className="text-sm" />
                      )}
                    </span>
                  )}
                </div>

                {hasSubmenu && isExpanded && (
                  <div className="ml-8 mt-1 mb-2 space-y-1">
                    {item.submenu.map((subItem) => (
                      <Link
                        key={subItem.path}
                        to={subItem.path}
                        className={`block px-3 py-2.5 text-sm rounded-lg transition duration-200 ${
                          isActive(subItem.path, true)
                            ? "bg-gray-800 text-blue-300 font-medium"
                            : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                        }`}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-800 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2.5 text-red-300 hover:text-white text-sm font-medium transition rounded-lg hover:bg-red-900/30"
          >
            <FiLogOut className="mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-gray-100">
        <section className="flex-1 overflow-y-auto p-6 bg-gray-100">
          <div className="bg-white rounded-xl shadow-xs p-6 min-h-[calc(100vh-120px)] border border-gray-200">
            {children}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminLayout;
