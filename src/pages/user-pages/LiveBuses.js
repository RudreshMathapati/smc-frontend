// import React, { useEffect, useState, useRef } from "react";
// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";
// import axiosInstance from "../../utils/axiosInstance";

// // Fix Leaflet default marker icons (webpack/file-loader path fix)
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
//   iconUrl: require("leaflet/dist/images/marker-icon.png"),
//   shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
// });

// const DEFAULT_CENTER = [17.6646, 75.8934];
// const POLL_INTERVAL_MS = 5000; // 5 seconds

// const getLatestPerDevice = (arr) => {
//   const latest = {};
//   arr.forEach((item) => {
//     const id = item.deviceId || item.device || "unknown";
//     if (!latest[id] || new Date(item.timestamp) > new Date(latest[id].timestamp)) {
//       latest[id] = item;
//     }
//   });
//   return Object.values(latest);
// };

// const LiveBuses = () => {
//   const [markers, setMarkers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [live, setLive] = useState(true);
//   const pollRef = useRef(null);

//   const fetchGps = async () => {
//     try {
//       const res = await axiosInstance.get("/gps");
//       const data = res.data;
//       const latest = getLatestPerDevice(data);
//       setMarkers(latest.map((d) => ({
//         deviceId: d.deviceId,
//         lat: d.latitude,
//         lng: d.longitude,
//         timestamp: d.timestamp,
//       })));
//       setError(null);
//     } catch (err) {
//       console.error("Error fetching GPS:", err);
//       setError("Failed to fetch GPS data");
//       setMarkers([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchGps();

//     if (live) {
//       pollRef.current = setInterval(fetchGps, POLL_INTERVAL_MS);
//     }

//     return () => {
//       if (pollRef.current) clearInterval(pollRef.current);
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [live]);

//   return (
//     <div className="min-h-screen p-4 md:p-6 bg-gray-50">
//       <div className="max-w-6xl mx-auto space-y-4">
//         <div className="flex items-center justify-between gap-4">
//           <h1 className="text-xl md:text-2xl font-bold">Live Buses Map</h1>
//           <div className="flex items-center gap-2">
//             <button
//               onClick={() => setLive((s) => !s)}
//               className={`px-4 py-2 rounded-lg font-medium border ${live ? "bg-green-600 text-white border-green-700" : "bg-white text-gray-700"}`}
//             >
//               {live ? "Live: ON" : "Live: OFF"}
//             </button>
//           </div>
//         </div>

//         <div className="bg-white rounded-xl shadow overflow-hidden">
//           <div style={{ height: "70vh", width: "100%" }}>
//             <MapContainer center={DEFAULT_CENTER} zoom={13} style={{ height: "100%", width: "100%" }}>
//               <TileLayer
//                 attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
//                 url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//               />

//               {markers.map((m) => (
//                 <Marker key={m.deviceId} position={[m.lat, m.lng]}>
//                   <Popup>
//                     <div className="text-sm">
//                       <div className="font-medium">Device: {m.deviceId}</div>
//                       <div>Lat: {m.lat.toFixed(6)}</div>
//                       <div>Lng: {m.lng.toFixed(6)}</div>
//                       <div className="text-xs text-gray-500">{new Date(m.timestamp).toLocaleString()}</div>
//                     </div>
//                   </Popup>
//                 </Marker>
//               ))}
//             </MapContainer>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div className="bg-white p-4 rounded-xl shadow-sm">
//             <h3 className="font-semibold mb-2">Status</h3>
//             {loading ? (
//               <p className="text-sm text-gray-600">Loading positions…</p>
//             ) : error ? (
//               <p className="text-sm text-red-600">{error}</p>
//             ) : (
//               <p className="text-sm text-gray-600">{markers.length} device(s) shown</p>
//             )}
//             <p className="mt-2 text-xs text-gray-500">Polling: every {POLL_INTERVAL_MS / 1000}s</p>
//           </div>

//           <div className="bg-white p-4 rounded-xl shadow-sm">
//             <h3 className="font-semibold mb-2">Devices</h3>
//             {markers.length === 0 ? (
//               <p className="text-sm text-gray-500">No devices available</p>
//             ) : (
//               <ul className="text-sm space-y-2">
//                 {markers.map((m) => (
//                   <li key={m.deviceId} className="flex items-center justify-between">
//                     <div>{m.deviceId}</div>
//                     <div className="text-xs text-gray-500">{new Date(m.timestamp).toLocaleTimeString()}</div>
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LiveBuses;

import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axiosInstance from "../../utils/axiosInstance";

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const DEFAULT_CENTER = [17.6646, 75.8934];
const POLL_INTERVAL_MS = 5000;

const getLatestPerDevice = (arr) => {
    const latest = {};
    arr.forEach((item) => {
        const id = item.deviceId || item.device || "unknown";
        if (
            !latest[id] ||
            new Date(item.timestamp) > new Date(latest[id].timestamp)
        ) {
            latest[id] = item;
        }
    });
    return Object.values(latest);
};

const LiveBuses = () => {
    const [markers, setMarkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [live, setLive] = useState(true);
    const pollRef = useRef(null);

    const fetchGps = async () => {
        try {
            const res = await axiosInstance.get("/api/gps");
            const data = res.data;
            const latest = getLatestPerDevice(data);
            setMarkers(
                latest.map((d) => ({
                    deviceId: d.deviceId,
                    lat: d.latitude,
                    lng: d.longitude,
                    timestamp: d.timestamp,
                }))
            );
        } catch (err) {
            console.error("Error fetching GPS:", err);
            setMarkers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGps();
        if (live) {
            pollRef.current = setInterval(fetchGps, POLL_INTERVAL_MS);
        }
        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, [live]);

    // Custom bus icon
    const busIcon = new L.Icon({
        iconUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ef4444" width="32" height="32"><path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/></svg>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
        className: "bus-icon",
    });

    return (
        <div className="min-h-screen p-4 md:p-6 bg-gradient-to-br from-gray-50 to-white">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                            Live Bus Tracker
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Real-time monitoring of fleet locations
                        </p>
                    </div>

                    {/* Live Toggle */}
                    <div className="flex items-center gap-3 bg-white rounded-xl shadow-sm p-2 border border-gray-100">
                        <div className="flex items-center gap-2">
                            <div
                                className={`w-3 h-3 rounded-full ${
                                    live
                                        ? "bg-green-500 animate-pulse"
                                        : "bg-gray-300"
                                }`}
                            ></div>
                            <span className="text-sm font-medium text-gray-700">
                                {live ? "Live Updating" : "Paused"}
                            </span>
                        </div>
                        <button
                            onClick={() => setLive((s) => !s)}
                            className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-300 ${
                                live ? "bg-green-500" : "bg-gray-300"
                            }`}
                        >
                            <span
                                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 ${
                                    live ? "translate-x-9" : "translate-x-1"
                                }`}
                            />
                        </button>
                    </div>
                </div>

                {/* Main Map Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                                    <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                                </div>
                                <div>
                                    <h2 className="font-semibold text-gray-800">
                                        Live Map View
                                    </h2>
                                    <p className="text-xs text-gray-500">
                                        {markers.length} active vehicles
                                    </p>
                                </div>
                            </div>
                            <div className="text-xs text-gray-500">
                                Updates every {POLL_INTERVAL_MS / 1000}s
                            </div>
                        </div>
                    </div>

                    <div
                        style={{ height: "70vh", width: "100%" }}
                        className="relative"
                    >
                        {loading && (
                            <div className="absolute inset-0 bg-white/80 z-[1000] flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-12 h-12 border-4 border-gray-200 border-t-red-500 rounded-full animate-spin mx-auto"></div>
                                    <p className="mt-4 text-gray-600 font-medium">
                                        Loading live locations...
                                    </p>
                                </div>
                            </div>
                        )}

                        <MapContainer
                            center={DEFAULT_CENTER}
                            zoom={13}
                            style={{ height: "100%", width: "100%" }}
                            className="rounded-b-2xl"
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            {markers.map((m) => (
                                <Marker
                                    key={m.deviceId}
                                    position={[m.lat, m.lng]}
                                    icon={busIcon}
                                >
                                    <Popup className="rounded-xl shadow-lg">
                                        <div className="p-3 min-w-[200px]">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                                                    <div className="w-6 h-6 bg-red-500 rounded-full"></div>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">
                                                        {m.deviceId}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Vehicle ID
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-2 border-t pt-3">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">
                                                        Coordinates:
                                                    </span>
                                                    <span className="font-mono text-gray-900">
                                                        {m.lat.toFixed(4)},{" "}
                                                        {m.lng.toFixed(4)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">
                                                        Last Update:
                                                    </span>
                                                    <span className="font-medium text-gray-900">
                                                        {new Date(
                                                            m.timestamp
                                                        ).toLocaleTimeString(
                                                            [],
                                                            {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            }
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                </div>

                {/* Stats & Devices Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Stats Card */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            Live Statistics
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <div>
                                    <div className="text-sm text-gray-500">
                                        Active Vehicles
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {markers.length}
                                    </div>
                                </div>
                                <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                                    <svg
                                        className="w-6 h-6 text-red-500"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h4v1a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H20a1 1 0 001-1V5a1 1 0 00-1-1H3z" />
                                    </svg>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <div>
                                    <div className="text-sm text-gray-500">
                                        Update Interval
                                    </div>
                                    <div className="text-xl font-bold text-gray-900">
                                        {POLL_INTERVAL_MS / 1000}s
                                    </div>
                                </div>
                                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                                    <svg
                                        className="w-6 h-6 text-blue-500"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Active Vehicles Card */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            Active Vehicles
                        </h3>

                        {markers.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg
                                        className="w-8 h-8 text-gray-400"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <p className="text-gray-500">
                                    No active vehicles found
                                </p>
                                <p className="text-sm text-gray-400 mt-1">
                                    Waiting for GPS data...
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                {markers.map((m) => (
                                    <div
                                        key={m.deviceId}
                                        className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors duration-200 group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                                    <div className="w-6 h-6 bg-red-500 rounded-full"></div>
                                                </div>
                                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">
                                                    {m.deviceId}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Updated{" "}
                                                    {new Date(
                                                        m.timestamp
                                                    ).toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-mono text-sm text-gray-700">
                                                {m.lat.toFixed(4)},{" "}
                                                {m.lng.toFixed(4)}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Location
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Note */}
                <div className="text-center text-sm text-gray-400 pt-4">
                    <p>
                        Real-time tracking system • Auto-refresh every{" "}
                        {POLL_INTERVAL_MS / 1000} seconds
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LiveBuses;
