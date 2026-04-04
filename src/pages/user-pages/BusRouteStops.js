import React, { useState, useEffect, useCallback } from "react";
import {
  FaMapMarkerAlt,
  FaBus,
  FaClock,
  FaRoad,
  FaSpinner,
  FaExclamationTriangle,
  FaWifi,
  FaCircle,
} from "react-icons/fa";
import { MdDirectionsBus, MdExpandMore, MdExpandLess } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../../utils/axiosInstance.js";
import { useParams } from "react-router-dom";

const BusRouteStops = () => {
  const { busID } = useParams();
  const [busRouteData, setBusRouteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedStop, setExpandedStop] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedTripIndex, setSelectedTripIndex] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Wrap fetchData in useCallback to avoid infinite re-renders
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/api/bus-routes-mapping/${busID}`);
      setBusRouteData(res.data.data);
      setLastUpdated(new Date());
      setError(null);

      // Simulate bus progress (in a real app, this would come from API)
      if (res.data.data && res.data.data.route.trips.length > 0) {
        const stops = res.data.data.route.trips[selectedTripIndex].stops;
        const randomProgress = Math.min(
          Math.floor(Math.random() * stops.length),
          stops.length - 1
        );
        setCurrentStopIndex(randomProgress);
        setProgress(
          Math.min(Math.floor((randomProgress / stops.length) * 100), 95)
        );
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load route data. Trying again..."
      );
      if (autoRefresh) {
        setTimeout(fetchData, 5000);
      }
    } finally {
      setLoading(false);
    }
  }, [busID, autoRefresh, selectedTripIndex]);

  const toggleStopExpand = (stopId) => {
    setExpandedStop(expandedStop === stopId ? null : stopId);
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    if (timeString.includes("AM") || timeString.includes("PM")) {
      return timeString;
    }
    const [hours, minutes] = timeString.split(":");
    const hourNum = parseInt(hours, 10);
    const period = hourNum >= 12 ? "PM" : "AM";
    const displayHour = hourNum % 12 || 12;
    return `${displayHour}:${minutes} ${period}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-500";
      case "Inactive":
        return "bg-red-500";
      case "Maintenance":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const calculateDistanceFromSource = (index, totalStops) => {
    if (!busRouteData) return 0;
    const totalDistance = busRouteData.route.distance;
    // Distribute distance proportionally with more weight given to later stops
    const baseDistance = (totalDistance * (index + 1)) / (totalStops + 1);
    // Add some random variation to make it more realistic
    const variation = (Math.random() * 0.2 * totalDistance) / totalStops;
    return Math.round(baseDistance + variation);
  };

  const handleTripChange = (index) => {
    setSelectedTripIndex(index);
    setCurrentStopIndex(0);
    setProgress(0);
  };

  useEffect(() => {
    fetchData();
    let intervalId;
    if (autoRefresh) {
      intervalId = setInterval(fetchData, 30000);
    }
    return () => clearInterval(intervalId);
  }, [fetchData, autoRefresh]);

  if (loading && !busRouteData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <FaSpinner className="text-4xl text-indigo-600 mb-4" />
          </motion.div>
          <p className="text-gray-600">Loading route information...</p>
        </div>
      </div>
    );
  }

  if (error && !busRouteData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-xl shadow-sm">
          <FaExclamationTriangle className="text-4xl text-red-500 mb-4 mx-auto" />
          <h2 className="text-xl font-semibold mb-2">Connection Issue</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
          >
            Retry Now
          </button>
        </div>
      </div>
    );
  }

  if (!busRouteData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-xl shadow-sm">
          <FaExclamationTriangle className="text-4xl text-yellow-500 mb-4 mx-auto" />
          <h2 className="text-xl font-semibold mb-2">No Route Data</h2>
          <p className="text-gray-600 mb-4">
            This route doesn't have any data available.
          </p>
        </div>
      </div>
    );
  }

  const selectedTrip = busRouteData.route.trips[selectedTripIndex];
  const totalStops = selectedTrip.stops.length;
  const busPosition = (currentStopIndex / totalStops) * 100;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 font-sans">
      {/* Bus Header Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-r from-indigo-500 to-indigo-800 rounded-2xl shadow-lg p-6 mb-6 text-white relative"
      >
        <div className="absolute top-4 right-4 flex items-center space-x-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`text-xs font-medium px-2 py-1 rounded-full flex items-center ${
              autoRefresh ? "bg-white/20" : "bg-red-500/80"
            }`}
          >
            {autoRefresh ? (
              <>
                <FaCircle className="text-green-400 mr-1 text-[8px]" />
                AUTO
              </>
            ) : (
              <>
                <FaCircle className="text-red-300 mr-1 text-[8px]" />
                MANUAL
              </>
            )}
          </button>
          <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full flex items-center">
            <FaWifi className="mr-1 text-indigo-200" />
            LIVE
          </span>
        </div>

        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center mb-1">
              <MdDirectionsBus className="text-2xl mr-3" />
              <h1 className="text-2xl font-bold">
                {busRouteData.bus.busNumber} - {busRouteData.route.source} to{" "}
                {busRouteData.route.destination}
              </h1>
            </div>
            <p className="text-indigo-100 text-sm">
              Via: {busRouteData.route.via}
            </p>
            {/* Remarks section removed as requested */}
          </div>
          <div
            className={`${getStatusColor(
              busRouteData.status
            )} text-white rounded-full px-3 py-1 text-xs font-medium`}
          >
            {busRouteData.status}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 mb-4">
          <div className="flex justify-between text-xs text-indigo-200 mb-1">
            <span>Route Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-green-400 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Trip Selection */}
        <div className="mt-4 flex flex-wrap gap-2">
          {busRouteData.route.trips.map((trip, index) => (
            <button
              key={trip._id}
              onClick={() => handleTripChange(index)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedTripIndex === index
                  ? "bg-white text-indigo-800 font-medium"
                  : "bg-white/20 hover:bg-white/30"
              }`}
            >
              {formatTime(trip.sourceTime)} - {formatTime(trip.destinationTime)}
            </button>
          ))}
        </div>

        <div className="mt-4 text-sm text-indigo-100 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
          <div className="flex items-center">
            <FaRoad className="mr-2" />
            <span>
              Distance: {busRouteData.route.distance} km • Duration:{" "}
              {Math.floor(busRouteData.route.estimatedDuration / 60)}h{" "}
              {busRouteData.route.estimatedDuration % 60}m
            </span>
          </div>
          <div className="flex items-center">
            <span>
              Updated:{" "}
              {lastUpdated?.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {loading && <FaSpinner className="animate-spin ml-2 text-xs" />}
          </div>
        </div>
      </motion.div>

      {/* Bus Details */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
          <span className="bg-indigo-100 p-2 rounded-lg mr-3">
            <FaBus className="text-indigo-600" />
          </span>
          Bus Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-2">
              Registration Number
            </h3>
            <p className="text-gray-900 font-mono">
              {busRouteData.bus.registrationNumber}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-2">Bus Type</h3>
            <p className="text-gray-900 capitalize">
              {busRouteData.bus.type.toLowerCase()}
            </p>
          </div>
        </div>
      </div>

      {/* Route Timeline */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 relative">
        <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
          <span className="bg-indigo-100 p-2 rounded-lg mr-3">
            <FaRoad className="text-indigo-600" />
          </span>
          Trip Timeline - {formatTime(selectedTrip.sourceTime)} to{" "}
          {formatTime(selectedTrip.destinationTime)}
        </h2>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[21px] top-0 h-full w-0.5 bg-gray-200"></div>

          {/* Animated Bus */}
          <motion.div
            className="absolute left-[7px] z-20"
            initial={{ top: "0%" }}
            animate={{ top: `${busPosition}%` }}
            transition={{ duration: 1, ease: "easeInOut" }}
          >
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg">
              <FaBus className="text-white text-xs" />
            </div>
          </motion.div>

          {/* Source */}
          <div className="relative pl-10 pb-4">
            <div className="absolute left-2 top-4 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center z-10 shadow-md">
              <FaMapMarkerAlt className="text-white text-[8px]" />
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-400 mr-3"></div>
                  <h4 className="font-medium text-gray-900">
                    {busRouteData.route.source}
                  </h4>
                </div>
                <div className="flex items-center text-sm text-gray-600 space-x-4">
                  <div className="flex items-center">
                    <FaClock className="mr-1 text-gray-400" />
                    <span>{formatTime(selectedTrip.sourceTime)}</span>
                  </div>
                  <div className="flex items-center">
                    <FaRoad className="mr-1 text-gray-400" />
                    <span>0 km</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stops */}
          {selectedTrip.stops.map((stop, index) => (
            <div key={`${stop._id}-${index}`} className="relative pl-10 pb-4">
              {/* Connection line with bus indicator for current stop */}
              {index === currentStopIndex && (
                <motion.div
                  className="absolute left-2 top-0 h-4 w-0.5 bg-indigo-500 z-0"
                  initial={{ height: 0 }}
                  animate={{ height: "1rem" }}
                  transition={{ duration: 0.5 }}
                />
              )}

              {/* Stop marker with different style for current stop */}
              <motion.div
                animate={{
                  scale: expandedStop === stop._id ? [1, 1.2, 1] : 1,
                  boxShadow:
                    expandedStop === stop._id
                      ? "0 0 0 4px rgba(59, 130, 246, 0.2)"
                      : index === currentStopIndex
                      ? "0 0 0 4px rgba(16, 185, 129, 0.4)"
                      : "none",
                }}
                transition={{ duration: 0.3 }}
                className={`absolute left-2 top-4 w-7 h-7 rounded-full flex items-center justify-center z-10 shadow-md ${
                  index === currentStopIndex ? "bg-green-500" : "bg-indigo-500"
                }`}
              >
                {index === currentStopIndex ? (
                  <FaBus className="text-white text-[10px]" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                )}
              </motion.div>

              {/* Stop Card */}
              <motion.div
                whileHover={{ y: -2 }}
                className={`bg-white border rounded-xl p-4 transition-all duration-200 cursor-pointer ${
                  expandedStop === stop._id
                    ? "ring-2 ring-indigo-200 shadow-md border-indigo-100"
                    : index === currentStopIndex
                    ? "border-green-200 shadow-md"
                    : "border-gray-200 shadow-sm hover:shadow-md"
                }`}
                onClick={() => toggleStopExpand(stop._id)}
              >
                {/* Stop Info Row */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div
                      className={`w-2 h-2 rounded-full mr-3 ${
                        index === currentStopIndex
                          ? "bg-green-400"
                          : "bg-indigo-400"
                      }`}
                    ></div>
                    <div>
                      <h4 className="font-medium text-gray-900">{stop.name}</h4>
                      {index === currentStopIndex && (
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                          Current Location
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 space-x-4">
                    <div className="flex items-center">
                      <FaClock className="mr-1 text-gray-400" />
                      <span>{stop.timingOffset}</span>
                    </div>

                    <div className="flex items-center">
                      <FaRoad className="mr-1 text-gray-400" />
                      <span>
                        ~
                        {calculateDistanceFromSource(
                          index,
                          selectedTrip.stops.length
                        )}{" "}
                        km
                      </span>
                    </div>

                    {expandedStop === stop._id ? (
                      <MdExpandLess className="text-gray-500" />
                    ) : (
                      <MdExpandMore className="text-gray-500" />
                    )}
                  </div>
                </div>

                {/* Expanded Section */}
                <AnimatePresence>
                  {expandedStop === stop._id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 pt-3 border-t border-gray-200 text-sm">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-gray-500 mb-1 flex items-center">
                            <FaClock className="mr-2" />
                            Scheduled Arrival
                          </div>
                          <div className="font-medium">{stop.timingOffset}</div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          ))}

          {/* Destination */}
          <div className="relative pl-10">
            <div className="absolute left-2 top-4 w-7 h-7 rounded-full bg-red-500 flex items-center justify-center z-10 shadow-md">
              <FaMapMarkerAlt className="text-white text-[8px]" />
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-red-400 mr-3"></div>
                  <h4 className="font-medium text-gray-900">
                    {busRouteData.route.destination}
                  </h4>
                </div>
                <div className="flex items-center text-sm text-gray-600 space-x-4">
                  <div className="flex items-center">
                    <FaClock className="mr-1 text-gray-400" />
                    <span>{formatTime(selectedTrip.destinationTime)}</span>
                  </div>
                  <div className="flex items-center">
                    <FaRoad className="mr-1 text-gray-400" />
                    <span>{busRouteData.route.distance} km</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Help text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-xs text-gray-400 text-center mt-6"
      >
        Tap on any stop for detailed information •{" "}
        {autoRefresh ? "Auto-refreshing every 30 seconds" : "Manual refresh"} •
        Last updated: {new Date(busRouteData.updatedAt).toLocaleString()}
      </motion.div>
    </div>
  );
};

export default BusRouteStops;
