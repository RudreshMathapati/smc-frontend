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
// const socket = io(process.env.REACT_APP_API_URL, {
//     transports: ["websocket"],
//     withCredentials: true,
// });
setInterval(() => {
const socket = io(process.env.REACT_APP_API_URL, {
  transports: ["websocket", "polling"], // 👈 IMPORTANT
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});
}, 2000);
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
            const res = await axiosInstance.get("/api/gps");
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
