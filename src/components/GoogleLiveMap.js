// import React, { useEffect, useState, useCallback } from "react";
// import { GoogleMap, Marker, InfoWindow, useLoadScript } from "@react-google-maps/api";
// import axiosInstance from "../utils/axiosInstance";

// const containerStyle = {
//   width: "100%",
//   height: "600px",
// };

// const centerDefault = { lat: 17.6599, lng: 75.9064 };
// const POLL_INTERVAL_MS = 5000; // 5 seconds

// const GoogleLiveMap = () => {
//   const { isLoaded, loadError } = useLoadScript({
//     googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "",
//   });

//   const [markers, setMarkers] = useState([]);
//   const [selected, setSelected] = useState(null);

//   const fetchGps = useCallback(async () => {
//     try {
//       const res = await axiosInstance.get("/gps");
//       if (res.data && res.data.success) {
//         const data = res.data.data.map((d) => ({
//           id: d._id || d.id || d._id,
//           deviceId: d.deviceId || d._id,
//           lat: parseFloat(d.latitude),
//           lng: parseFloat(d.longitude),
//           timestamp: d.timestamp,
//         }));
//         setMarkers(data);
//       } else if (Array.isArray(res.data)) {
//         // backward compatibility
//         setMarkers(res.data.map((d) => ({ id: d._id, deviceId: d.deviceId, lat: +d.latitude, lng: +d.longitude, timestamp: d.timestamp })));
//       }
//     } catch (err) {
//       console.error("Error fetching GPS:", err.message || err);
//     }
//   }, []);

//   useEffect(() => {
//     fetchGps();
//     const id = setInterval(fetchGps, POLL_INTERVAL_MS);
//     return () => clearInterval(id);
//   }, [fetchGps]);

//   if (loadError) return <div>Error loading Google Maps</div>;
//   if (!isLoaded) return <div>Loading Google Maps…</div>;

//   const defaultCenter = markers.length > 0 ? { lat: markers[0].lat, lng: markers[0].lng } : centerDefault;

//   return (
//     <GoogleMap mapContainerStyle={containerStyle} center={defaultCenter} zoom={13}>
//       {markers.map((m) => (
//         <Marker key={m.id || m.deviceId} position={{ lat: m.lat, lng: m.lng }} onClick={() => setSelected(m)} />
//       ))}

//       {selected && (
//         <InfoWindow position={{ lat: selected.lat, lng: selected.lng }} onCloseClick={() => setSelected(null)}>
//           <div>
//             <strong>Device:</strong> {selected.deviceId}
//             <br />
//             <strong>Time:</strong> {new Date(selected.timestamp).toLocaleString()}
//           </div>
//         </InfoWindow>
//       )}
//     </GoogleMap>
//   );
// };

// export default GoogleLiveMap;



// import React, { useEffect, useState, useCallback } from "react";
// import {
//     GoogleMap,
//     Marker,
//     InfoWindow,
//     useLoadScript,
// } from "@react-google-maps/api";
// import axiosInstance from "../utils/axiosInstance";

// const containerStyle = {
//     width: "100%",
//     height: "600px",
// };

// const defaultCenter = { lat: 17.6599, lng: 75.9064 };
// const POLL_INTERVAL_MS = 5000;

// const GoogleLiveMap = () => {
//     const { isLoaded, loadError } = useLoadScript({
//         googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
//     });

//     const [markers, setMarkers] = useState([]);
//     const [selected, setSelected] = useState(null);

//     const fetchGps = useCallback(async () => {
//         try {
//             const res = await axiosInstance.get("/gps");
//             if (!res.data?.success) return;

//             setMarkers(
//                 res.data.data.map((d) => ({
//                     id: d.id || d._id,
//                     deviceId: d.deviceId,
//                     lat: Number(d.latitude),
//                     lng: Number(d.longitude),
//                     timestamp: d.timestamp,
//                 }))
//             );
//         } catch (err) {
//             console.error(err);
//         }
//     }, []);

//     useEffect(() => {
//         fetchGps();
//         const interval = setInterval(fetchGps, POLL_INTERVAL_MS);
//         return () => clearInterval(interval);
//     }, [fetchGps]);

//     if (loadError) return <div>Map load error</div>;
//     if (!isLoaded) return <div>Loading Map...</div>;

//     return (
//         <GoogleMap
//             mapContainerStyle={containerStyle}
//             center={markers[0] || defaultCenter}
//             zoom={13}
//         >
//             {markers.map((m) => (
//                 <Marker
//                     key={m.id}
//                     position={{ lat: m.lat, lng: m.lng }}
//                     onClick={() => setSelected(m)}
//                 />
//             ))}

//             {selected && (
//                 <InfoWindow
//                     position={{ lat: selected.lat, lng: selected.lng }}
//                     onCloseClick={() => setSelected(null)}
//                 >
//                     <div>
//                         <b>Device:</b> {selected.deviceId}
//                         <br />
//                         <b>Updated:</b>{" "}
//                         {new Date(selected.timestamp).toLocaleString()}
//                     </div>
//                 </InfoWindow>
//             )}
//         </GoogleMap>
//     );
// };

// export default GoogleLiveMap;
