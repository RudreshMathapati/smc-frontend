// import React, { useEffect, useState } from "react";
// import {
//     GoogleMap,
//     Marker,
//     InfoWindow,
//     useLoadScript,
//     DirectionsRenderer,
// } from "@react-google-maps/api";
// import { io } from "socket.io-client";
// import axiosInstance from "../../utils/axiosInstance";
// import {
//     FiNavigation,
//     FiRefreshCw,
//     FiMapPin,
//     FiClock,
//     // FiWifi,
//     FiAlertCircle,
//     FiMaximize2,
//     FiMinimize2,
// } from "react-icons/fi";

// // 🔌 Socket connection
// const socket = io("http://localhost:5000", {
//     transports: ["websocket"],
// });

// const containerStyle = {
//     width: "100%",
//     height: "750px",
// };

// const defaultCenter = { lat: 17.6599, lng: 75.9064 };

// // Custom bus marker icon
// const busIcon = {
//     path: "M8 16C8 17.1046 7.10457 18 6 18C4.89543 18 4 17.1046 4 16C4 14.8954 4.89543 14 6 14C7.10457 14 8 14.8954 8 16ZM20 16C20 17.1046 19.1046 18 18 18C16.8954 18 16 17.1046 16 16C16 14.8954 16.8954 14 18 14C19.1046 14 20 14.8954 20 16ZM22 12V7C22 6.44772 21.5523 6 21 6H19V4C19 2.89543 18.1046 2 17 2H7C5.89543 2 5 2.89543 5 4V6H3C2.44772 6 2 6.44772 2 7V12C2 12.5523 2.44772 13 3 13H5V19C5 19.5523 5.44772 20 6 20H7C7.55228 20 8 19.5523 8 19V18H16V19C16 19.5523 16.4477 20 17 20H18C18.5523 20 19 19.5523 19 19V13H21C21.5523 13 22 12.5523 22 12ZM7 4H17V6H7V4ZM19 12H17V10H7V12H5V8H19V12Z",
//     fillColor: "#3B82F6",
//     fillOpacity: 1,
//     strokeWeight: 1,
//     strokeColor: "#1D4ED8",
//     scale: 1.5,
//     anchor: { x: 12, y: 12 },
// };

// // Selected bus marker icon
// const selectedBusIcon = {
//     ...busIcon,
//     fillColor: "#EF4444",
//     strokeColor: "#DC2626",
//     scale: 2,
// };

// const GoogleLiveMap = ({ source, destination }) => {
//     const { isLoaded, loadError } = useLoadScript({
//         googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
//     });

//     const [markers, setMarkers] = useState({});
//     const [selected, setSelected] = useState(null);
//     const [directions, setDirections] = useState(null);
//     const [isLoading, setIsLoading] = useState(true);
//     const [lastUpdate, setLastUpdate] = useState(null);
//     const [isFullscreen, setIsFullscreen] = useState(false);
//     const [connectionStatus, setConnectionStatus] = useState("connecting");

//     /* ------------------------------
//      1️⃣ Load initial GPS positions
//   ------------------------------ */
//     useEffect(() => {
//         const fetchInitialGps = async () => {
//             try {
//                 setIsLoading(true);
//                 const res = await axiosInstance.get("/gps");
//                 if (!res.data?.success) return;

//                 const initial = {};
//                 res.data.data.forEach((d) => {
//                     initial[d.deviceId] = {
//                         deviceId: d.deviceId,
//                         lat: Number(d.latitude),
//                         lng: Number(d.longitude),
//                         timestamp: d.timestamp,
//                         speed: d.speed || "N/A",
//                         vehicleNo: d.vehicleNo || `BUS-${d.deviceId}`,
//                     };
//                 });
//                 setMarkers(initial);
//                 setLastUpdate(new Date());
//             } catch (err) {
//                 console.error("Initial GPS fetch failed:", err);
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         fetchInitialGps();
//     }, []);

//     /* ------------------------------
//      2️⃣ Live GPS updates (Socket)
//   ------------------------------ */
//     useEffect(() => {
//         socket.on("connect", () => {
//             setConnectionStatus("connected");
//         });

//         socket.on("disconnect", () => {
//             setConnectionStatus("disconnected");
//         });

//         socket.on("gps:update", (data) => {
//             setMarkers((prev) => ({
//                 ...prev,
//                 [data.deviceId]: {
//                     deviceId: data.deviceId,
//                     lat: Number(data.latitude),
//                     lng: Number(data.longitude),
//                     timestamp: data.timestamp,
//                     speed: data.speed || "N/A",
//                     vehicleNo: data.vehicleNo || `BUS-${data.deviceId}`,
//                 },
//             }));
//             setLastUpdate(new Date());
//         });

//         return () => {
//             socket.off("gps:update");
//             socket.off("connect");
//             socket.off("disconnect");
//         };
//     }, []);

//     /* ------------------------------
//      3️⃣ Draw route (optional)
//   ------------------------------ */
//     useEffect(() => {
//         if (!source || !destination || !window.google) return;

//         const directionsService = new window.google.maps.DirectionsService();

//         directionsService.route(
//             {
//                 origin: { lat: source[0], lng: source[1] },
//                 destination: { lat: destination[0], lng: destination[1] },
//                 travelMode: window.google.maps.TravelMode.DRIVING,
//             },
//             (result, status) => {
//                 if (status === "OK") {
//                     setDirections(result);
//                 } else {
//                     console.error("Directions error:", status);
//                 }
//             }
//         );
//     }, [source, destination]);

//     const handleRefresh = async () => {
//         try {
//             setIsLoading(true);
//             const res = await axiosInstance.get("/gps");
//             if (!res.data?.success) return;

//             const updated = {};
//             res.data.data.forEach((d) => {
//                 updated[d.deviceId] = {
//                     deviceId: d.deviceId,
//                     lat: Number(d.latitude),
//                     lng: Number(d.longitude),
//                     timestamp: d.timestamp,
//                     speed: d.speed || "N/A",
//                     vehicleNo: d.vehicleNo || `BUS-${d.deviceId}`,
//                 };
//             });
//             setMarkers(updated);
//             setLastUpdate(new Date());
//         } catch (err) {
//             console.error("Refresh failed:", err);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const toggleFullscreen = () => {
//         setIsFullscreen(!isFullscreen);
//     };

//     const getConnectionColor = () => {
//         switch (connectionStatus) {
//             case "connected":
//                 return "bg-green-500";
//             case "disconnected":
//                 return "bg-red-500";
//             case "connecting":
//                 return "bg-yellow-500";
//             default:
//                 return "bg-gray-500";
//         }
//     };

//     const getConnectionText = () => {
//         switch (connectionStatus) {
//             case "connected":
//                 return "Live Connected";
//             case "disconnected":
//                 return "Disconnected";
//             case "connecting":
//                 return "Connecting...";
//             default:
//                 return "Unknown";
//         }
//     };

//     /* ------------------------------
//      Loading / Error states
//   ------------------------------ */
//     if (loadError)
//         return (
//             <div className="flex items-center justify-center h-full bg-gray-50 rounded-xl">
//                 <div className="text-center p-8">
//                     <FiAlertCircle
//                         className="mx-auto text-red-500 mb-4"
//                         size={48}
//                     />
//                     <h3 className="text-lg font-semibold text-gray-800 mb-2">
//                         Error Loading Map
//                     </h3>
//                     <p className="text-gray-600">
//                         Failed to load Google Maps. Please check your API key
//                         and internet connection.
//                     </p>
//                 </div>
//             </div>
//         );

//     if (!isLoaded)
//         return (
//             <div className="flex items-center justify-center h-full bg-gray-50 rounded-xl">
//                 <div className="text-center">
//                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//                     <p className="text-gray-600">Loading Google Maps...</p>
//                 </div>
//             </div>
//         );

//     const markerList = Object.values(markers);
//     const mapCenter =
//         markerList.length > 0
//             ? { lat: markerList[0].lat, lng: markerList[0].lng }
//             : defaultCenter;

//     return (
//         <div
//             className={`relative ${
//                 isFullscreen ? "fixed inset-0 z-50" : "h-[600px]"
//             }`}
//         >
//             {/* Map Controls Overlay */}
//             <div className="absolute top-4 left-4 z-10 space-y-3">
//                 {/* Status Card */}
//                 <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3">
//                     <div className="flex items-center gap-2">
//                         <div
//                             className={`w-3 h-3 rounded-full ${getConnectionColor()}`}
//                         ></div>
//                         <span className="text-sm font-medium">
//                             {getConnectionText()}
//                         </span>
//                     </div>
//                     {lastUpdate && (
//                         <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
//                             <FiClock size={12} />
//                             <span>
//                                 Updated:{" "}
//                                 {lastUpdate.toLocaleTimeString([], {
//                                     hour: "2-digit",
//                                     minute: "2-digit",
//                                 })}
//                             </span>
//                         </div>
//                     )}
//                 </div>

//                 {/* Active Buses Card */}
//                 <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3">
//                     <div className="flex items-center gap-2">
//                         <FiNavigation className="text-blue-600" />
//                         <span className="text-sm font-medium">
//                             Active Buses: {markerList.length}
//                         </span>
//                     </div>
//                 </div>
//             </div>

//             {/* Top Right Controls */}
//             <div className="absolute top-4 right-4 z-10 flex gap-2">
//                 <button
//                     onClick={handleRefresh}
//                     disabled={isLoading}
//                     className="bg-white hover:bg-gray-50 text-gray-700 p-2 rounded-lg shadow-lg transition-all hover:shadow-xl disabled:opacity-50 flex items-center gap-2"
//                 >
//                     <FiRefreshCw
//                         className={`${isLoading ? "animate-spin" : ""}`}
//                     />
//                     <span className="text-sm">Refresh</span>
//                 </button>

//                 <button
//                     onClick={toggleFullscreen}
//                     className="bg-white hover:bg-gray-50 text-gray-700 p-2 rounded-lg shadow-lg transition-all hover:shadow-xl flex items-center gap-2"
//                 >
//                     {isFullscreen ? <FiMinimize2 /> : <FiMaximize2 />}
//                     <span className="text-sm">
//                         {isFullscreen ? "Exit" : "Fullscreen"}
//                     </span>
//                 </button>
//             </div>

//             {/* Google Map */}
//             <GoogleMap
//                 mapContainerStyle={containerStyle}
//                 zoom={13}
//                 center={mapCenter}
//                 options={{
//                     zoomControl: true,
//                     mapTypeControl: false,
//                     scaleControl: true,
//                     streetViewControl: true,
//                     rotateControl: true,
//                     fullscreenControl: false,
//                     styles: [
//                         {
//                             featureType: "poi.business",
//                             stylers: [{ visibility: "off" }],
//                         },
//                         {
//                             featureType: "transit",
//                             elementType: "labels.icon",
//                             stylers: [{ visibility: "off" }],
//                         },
//                     ],
//                 }}
//             >
//                 {/* 🚌 LIVE BUS MARKERS */}
//                 {markerList.map((m) => (
//                     <Marker
//                         key={m.deviceId}
//                         position={{ lat: m.lat, lng: m.lng }}
//                         onClick={() => setSelected(m)}
//                         icon={
//                             selected?.deviceId === m.deviceId
//                                 ? selectedBusIcon
//                                 : busIcon
//                         }
//                         animation={window.google.maps.Animation.DROP}
//                     />
//                 ))}

//                 {/* 🛣️ ROUTE LINE */}
//                 {directions && (
//                     <DirectionsRenderer
//                         directions={directions}
//                         options={{
//                             polylineOptions: {
//                                 strokeColor: "#3B82F6",
//                                 strokeWeight: 4,
//                                 strokeOpacity: 0.7,
//                             },
//                             suppressMarkers: true,
//                         }}
//                     />
//                 )}

//                 {/* ℹ️ INFO WINDOW */}
//                 {selected && (
//                     <InfoWindow
//                         position={{ lat: selected.lat, lng: selected.lng }}
//                         onCloseClick={() => setSelected(null)}
//                         options={{
//                             pixelOffset: new window.google.maps.Size(0, -40),
//                         }}
//                     >
//                         <div className="p-2 min-w-[200px]">
//                             <div className="flex items-center gap-2 mb-2">
//                                 <div className="w-3 h-3 rounded-full bg-blue-500"></div>
//                                 <h3 className="font-bold text-gray-800">
//                                     {selected.vehicleNo}
//                                 </h3>
//                             </div>

//                             <div className="space-y-2">
//                                 <div className="flex items-center gap-2 text-sm">
//                                     <FiMapPin
//                                         className="text-gray-500"
//                                         size={14}
//                                     />
//                                     <span className="text-gray-600">
//                                         {selected.lat.toFixed(4)},{" "}
//                                         {selected.lng.toFixed(4)}
//                                     </span>
//                                 </div>

//                                 <div className="flex items-center gap-2 text-sm">
//                                     <FiClock
//                                         className="text-gray-500"
//                                         size={14}
//                                     />
//                                     <span className="text-gray-600">
//                                         {new Date(
//                                             selected.timestamp
//                                         ).toLocaleTimeString([], {
//                                             hour: "2-digit",
//                                             minute: "2-digit",
//                                         })}
//                                     </span>
//                                 </div>

//                                 {selected.speed && selected.speed !== "N/A" && (
//                                     <div className="flex items-center gap-2 text-sm">
//                                         <FiNavigation
//                                             className="text-gray-500"
//                                             size={14}
//                                         />
//                                         <span className="text-gray-600">
//                                             {selected.speed} km/h
//                                         </span>
//                                     </div>
//                                 )}

//                                 <div className="pt-2 border-t border-gray-100">
//                                     <p className="text-xs text-gray-500">
//                                         Device ID: {selected.deviceId}
//                                     </p>
//                                 </div>
//                             </div>
//                         </div>
//                     </InfoWindow>
//                 )}
//             </GoogleMap>

//             {/* Loading Overlay */}
//             {isLoading && (
//                 <div className="absolute inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-20">
//                     <div className="bg-white rounded-xl shadow-lg p-4 flex items-center gap-3">
//                         <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
//                         <span className="text-gray-700">
//                             Updating locations...
//                         </span>
//                     </div>
//                 </div>
//             )}

//             {/* Fullscreen Exit Button */}
//             {isFullscreen && (
//                 <div className="absolute bottom-4 right-4 z-10">
//                     <button
//                         onClick={toggleFullscreen}
//                         className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg shadow-lg transition-all hover:shadow-xl flex items-center gap-2"
//                     >
//                         <FiMinimize2 />
//                         Exit Fullscreen
//                     </button>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default GoogleLiveMap;






import React, { useEffect, useState } from "react";
import {
    GoogleMap,
    Marker,
    InfoWindow,
    useLoadScript,
    DirectionsRenderer,
} from "@react-google-maps/api";
import { io } from "socket.io-client";
import axiosInstance from "../../utils/axiosInstance";
import {
    FiNavigation,
    FiRefreshCw,
    FiMapPin,
    FiClock,
    FiAlertCircle,
} from "react-icons/fi";

/* 🔌 Socket */
const socket = io("http://localhost:5000", {
    transports: ["websocket"],
});

const containerStyle = {
    width: "100%",
    height: "100%",
};

const defaultCenter = { lat: 17.6599, lng: 75.9064 };

/* 🚌 Marker Icons */
const busIcon = {
    path: "M8 16C8 17.1046 7.10457 18 6 18C4.89543 18 4 17.1046 4 16C4 14.8954 4.89543 14 6 14C7.10457 14 8 14.8954 8 16ZM20 16C20 17.1046 19.1046 18 18 18C16.8954 18 16 17.1046 16 16C16 14.8954 16.8954 14 18 14C19.1046 14 20 14.8954 20 16ZM22 12V7C22 6.44772 21.5523 6 21 6H19V4C19 2.89543 18.1046 2 17 2H7C5.89543 2 5 2.89543 5 4V6H3C2.44772 6 2 6.44772 2 7V12C2 12.5523 2.44772 13 3 13H5V19C5 19.5523 5.44772 20 6 20H7C7.55228 20 8 19.5523 8 19V18H16V19C16 19.5523 16.4477 20 17 20H18C18.5523 20 19 19.5523 19 19V13H21C21.5523 13 22 12.5523 22 12ZM7 4H17V6H7V4ZM19 12H17V10H7V12H5V8H19V12Z",
    fillColor: "#2563EB",
    fillOpacity: 1,
    strokeWeight: 1,
    strokeColor: "#1E40AF",
    scale: 1.6,
};

const selectedBusIcon = {
    ...busIcon,
    fillColor: "#DC2626",
    strokeColor: "#991B1B",
    scale: 2,
};

const GoogleLiveMap = ({ source, destination }) => {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    });

    const [markers, setMarkers] = useState({});
    const [selected, setSelected] = useState(null);
    const [directions, setDirections] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    /* ------------------------------
        1️⃣ Initial GPS Fetch
    ------------------------------ */
    useEffect(() => {
        const fetchGps = async () => {
            setIsLoading(true);
            const res = await axiosInstance.get("/gps");
            if (!res.data?.success) return;

            const obj = {};
            res.data.data.forEach((d) => {
                obj[d.deviceId] = {
                    deviceId: d.deviceId,
                    lat: +d.latitude,
                    lng: +d.longitude,
                    timestamp: d.timestamp,
                    speed: d.speed || "N/A",
                    vehicleNo: d.vehicleNo || `BUS-${d.deviceId}`,
                };
            });
            setMarkers(obj);
            setIsLoading(false);
        };
        fetchGps();
    }, []);

    /* ------------------------------
        2️⃣ Live Socket Updates
    ------------------------------ */
    useEffect(() => {
        socket.on("gps:update", (d) => {
            setMarkers((prev) => ({
                ...prev,
                [d.deviceId]: {
                    deviceId: d.deviceId,
                    lat: +d.latitude,
                    lng: +d.longitude,
                    timestamp: d.timestamp,
                    speed: d.speed || "N/A",
                    vehicleNo: d.vehicleNo || `BUS-${d.deviceId}`,
                },
            }));
        });
        return () => socket.off("gps:update");
    }, []);

    /* ------------------------------
        3️⃣ Directions
    ------------------------------ */
    useEffect(() => {
        if (!source || !destination || !window.google) return;

        const service = new window.google.maps.DirectionsService();
        service.route(
            {
                origin: { lat: source[0], lng: source[1] },
                destination: { lat: destination[0], lng: destination[1] },
                travelMode: "DRIVING",
            },
            (res, status) => {
                if (status === "OK") setDirections(res);
            }
        );
    }, [source, destination]);

    if (loadError)
        return (
            <div className="flex justify-center items-center h-full">
                <FiAlertCircle size={40} className="text-red-500" />
            </div>
        );

    if (!isLoaded)
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full" />
            </div>
        );

    const markerList = Object.values(markers);
    const mapCenter =
        selected ?? (markerList.length ? markerList[0] : defaultCenter);

    return (
        <div className="flex w-full h-[750px] gap-4">
            {/* ================= MAP (75%) ================= */}
            <div className="w-[75%] relative rounded-xl overflow-hidden shadow">
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    zoom={13}
                    center={{ lat: mapCenter.lat, lng: mapCenter.lng }}
                    options={{ fullscreenControl: false }}
                >
                    {markerList.map((m) => (
                        <Marker
                            key={m.deviceId}
                            position={{ lat: m.lat, lng: m.lng }}
                            icon={
                                selected?.deviceId === m.deviceId
                                    ? selectedBusIcon
                                    : busIcon
                            }
                            onClick={() => setSelected(m)}
                        />
                    ))}

                    {directions && (
                        <DirectionsRenderer
                            directions={directions}
                            options={{ suppressMarkers: true }}
                        />
                    )}

                    {selected && (
                        <InfoWindow
                            position={{
                                lat: selected.lat,
                                lng: selected.lng,
                            }}
                            onCloseClick={() => setSelected(null)}
                        >
                            <div className="text-sm space-y-1">
                                <strong>{selected.vehicleNo}</strong>
                                <div>
                                    <FiClock className="inline" />{" "}
                                    {new Date(
                                        selected.timestamp
                                    ).toLocaleTimeString()}
                                </div>
                                <div>
                                    <FiNavigation className="inline" />{" "}
                                    {selected.speed} km/h
                                </div>
                            </div>
                        </InfoWindow>
                    )}
                </GoogleMap>

                {isLoading && (
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                        Updating...
                    </div>
                )}
            </div>

            {/* ================= TABLE (25%) ================= */}
            <div className="w-[25%] bg-white rounded-xl shadow p-4 overflow-y-auto">
                <h2 className="font-semibold mb-3 flex items-center gap-2">
                    <FiNavigation className="text-blue-600" />
                    Live Bus Positions
                </h2>

                <table className="w-full text-sm">
                    <thead className="bg-gray-100 sticky top-0">
                        <tr>
                            <th className="p-2 text-left">Bus</th>
                            <th className="p-2">Speed</th>
                            <th className="p-2">Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {markerList.map((bus) => (
                            <tr
                                key={bus.deviceId}
                                onClick={() => setSelected(bus)}
                                className={`cursor-pointer border-b hover:bg-blue-50 ${
                                    selected?.deviceId === bus.deviceId
                                        ? "bg-blue-100"
                                        : ""
                                }`}
                            >
                                <td className="p-2 font-medium">
                                    {bus.vehicleNo}
                                </td>
                                <td className="p-2 text-center">{bus.speed}</td>
                                <td className="p-2 text-xs text-center">
                                    {new Date(
                                        bus.timestamp
                                    ).toLocaleTimeString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GoogleLiveMap;
