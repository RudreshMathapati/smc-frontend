// path = version2Admin/Frontend/src/pages/admin-pages/ManageRoutes.js
import React, { useEffect, useState, useRef } from "react";
import AdminLayout from "./AdminLayout";
import { toast } from "react-toastify";
import {
  FiEdit,
  FiTrash2,
  FiPlus,
  FiX,
  FiMapPin,
  FiClock,
  FiCopy,
  FiClipboard,
} from "react-icons/fi";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import axiosInstance from "../../utils/axiosInstance";

const ManageRoutes = () => {
  const stopNameRef = useRef(null);
  const [originalStopsBackup, setOriginalStopsBackup] = useState([]);
  const [insertMessage, setInsertMessage] = useState("");
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [uniqueSources, setUniqueSources] = useState([]);
  const [uniqueDestinations, setUniqueDestinations] = useState([]);
  const [copiedTrip, setCopiedTrip] = useState(null);
  const [insertIndex, setInsertIndex] = useState(null);
  const [insertMode, setInsertMode] = useState(null); // "above" or "below"
  const [editAllMode, setEditAllMode] = useState(false);
  const [bulkStops, setBulkStops] = useState([]);
  const [form, setForm] = useState({
    source: "",
    destination: "",
    via: "",
    distance: "",
    estimatedDuration: "",
    trips: [
      {
        sourceTime: "",
        destinationTime: "",
        stops: [],
      },
    ],
  });

  const [newStop, setNewStop] = useState({
    name: "",
    timingOffset: "",
    latitude: "",
    longitude: "",
    stage: "", // ✅ ADD THIS
    sequence: 0,
  });

  const [editingRouteId, setEditingRouteId] = useState(null);
  const [currentTripIndex, setCurrentTripIndex] = useState(0);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/api/routes");
      setRoutes(res.data);

      // Fetch unique sources and destinations for suggestions
      const stopsRes = await axiosInstance.get("/api/routes");
      setUniqueSources(stopsRes.data.sources);
      setUniqueDestinations(stopsRes.data.destinations);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch routes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleTripChange = (e, tripIndex) => {
    const { name, value } = e.target;
    const updatedTrips = [...form.trips];
    updatedTrips[tripIndex] = { ...updatedTrips[tripIndex], [name]: value };
    setForm({ ...form, trips: updatedTrips });
  };

  const handleStopChange = (e) => {
    const { name, value } = e.target;
    setNewStop({ ...newStop, [name]: value });
  };

  const addTrip = () => {
    setForm({
      ...form,
      trips: [
        ...form.trips,
        {
          sourceTime: "",
          destinationTime: "",
          stops: [],
        },
      ],
    });
    setCurrentTripIndex(form.trips.length);
  };

  const removeTrip = (index) => {
    if (form.trips.length <= 1) {
      toast.error("At least one trip is required");
      return;
    }
    const updatedTrips = form.trips.filter((_, i) => i !== index);
    setForm({ ...form, trips: updatedTrips });
    setCurrentTripIndex(Math.min(currentTripIndex, updatedTrips.length - 1));
  };

  const copyTrip = (index) => {
    const tripToCopy = {
      ...form.trips[index],
      stops: [...form.trips[index].stops],
    };
    setCopiedTrip(tripToCopy);
    toast.success("Trip copied successfully");
  };

  const pasteTrip = (index) => {
    if (!copiedTrip) {
      toast.error("No trip copied to paste");
      return;
    }
    const updatedTrips = [...form.trips];
    updatedTrips[index] = { ...copiedTrip, stops: [...copiedTrip.stops] };
    setForm({ ...form, trips: updatedTrips });
    toast.success("Trip pasted successfully");
  };

  // const addStop = () => {
  //   if (!newStop.name || !newStop.timingOffset || !newStop.stage) {
  //     toast.error("Stop name, timing offset and stage are required");
  //     return;
  //   }

  //   const updatedTrips = [...form.trips];
  //   let stops = updatedTrips[currentTripIndex].stops;

  //   const newStopData = {
  //     name: newStop.name,
  //     timingOffset: newStop.timingOffset,
  //     latitude: newStop.latitude || "",
  //     longitude: newStop.longitude || "",
  //     stage: Number(newStop.stage),
  //   };

  //   if (insertIndex !== null) {
  //     if (insertMode === "above") {
  //       stops.splice(insertIndex, 0, newStopData);
  //     } else if (insertMode === "below") {
  //       stops.splice(insertIndex + 1, 0, newStopData);
  //     }
  //   } else {
  //     stops.push(newStopData);
  //   }

  //   // Recalculate sequence
  //   stops = stops.map((stop, idx) => ({
  //     ...stop,
  //     sequence: idx + 1,
  //   }));

  //   updatedTrips[currentTripIndex].stops = stops;
  //   setForm({ ...form, trips: updatedTrips });

  //   // Reset
  //   setInsertIndex(null);
  //   setInsertMode(null);

  //   setNewStop({
  //     name: "",
  //     timingOffset: "",
  //     latitude: "",
  //     longitude: "",
  //     stage: "",
  //     sequence: 0,
  //   });
  //   setInsertMessage("");
  // };

  const addStop = () => {
    if (!newStop.name || !newStop.timingOffset || !newStop.stage) {
      toast.error("Stop name, timing offset and stage are required");
      return;
    }

    const updatedTrips = [...form.trips];

    const currentTrip = updatedTrips[currentTripIndex];

    let stops = [...currentTrip.stops]; // ✅ deep copy

    const newStopData = {
      name: newStop.name,
      timingOffset: newStop.timingOffset,
      latitude: newStop.latitude || "",
      longitude: newStop.longitude || "",
      stage: Number(newStop.stage),
    };

    if (insertIndex !== null) {
      if (insertMode === "above") {
        stops.splice(insertIndex, 0, newStopData);
      } else if (insertMode === "below") {
        stops.splice(insertIndex + 1, 0, newStopData);
      }
    } else {
      stops.push(newStopData);
    }

    // Recalculate sequence
    stops = stops.map((stop, idx) => ({
      ...stop,
      sequence: idx + 1,
    }));

    updatedTrips[currentTripIndex] = {
      ...currentTrip,
      stops,
    };

    setForm({ ...form, trips: updatedTrips });

    // Reset
    setInsertIndex(null);
    setInsertMode(null);

    setNewStop({
      name: "",
      timingOffset: "",
      latitude: "",
      longitude: "",
      stage: "",
      sequence: 0,
    });

    setInsertMessage("");
  };

  // const removeStop = (stopIndex) => {
  //   const updatedTrips = [...form.trips];
  //   updatedTrips[currentTripIndex].stops = updatedTrips[
  //     currentTripIndex
  //   ].stops.filter((_, i) => i !== stopIndex);
  //   // Update sequence numbers
  //   updatedTrips[currentTripIndex].stops = updatedTrips[
  //     currentTripIndex
  //   ].stops.map((stop, idx) => ({ ...stop, sequence: idx + 1 }));
  //   setForm({ ...form, trips: updatedTrips });
  // };
  const removeStop = (stopIndex) => {
    const updatedTrips = [...form.trips];

    const currentTrip = updatedTrips[currentTripIndex];

    let stops = [...currentTrip.stops]; // ✅ copy

    stops = stops.filter((_, i) => i !== stopIndex);

    stops = stops.map((stop, idx) => ({
      ...stop,
      sequence: idx + 1,
    }));

    updatedTrips[currentTripIndex] = {
      ...currentTrip,
      stops,
    };

    setForm({ ...form, trips: updatedTrips });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      console.log("FORM SENDING:", form);
      // Validate at least one stop per trip
      for (const trip of form.trips) {
        if (!trip.sourceTime || !trip.destinationTime) {
          throw new Error("Each trip must have source and destination times");
        }
        if (trip.stops.length === 0) {
          throw new Error("Each trip must have at least one stop");
        }
      }

      if (editingRouteId) {
        await axiosInstance.put(`/api/routes/${editingRouteId}`, form);
        toast.success("Route updated successfully");
      } else {
        await axiosInstance.post("/api/routes", form);
        toast.success("Route added successfully");
      }

      fetchRoutes();
      resetForm();
      setShowForm(false);
    } catch (err) {
      toast.error(
        err.message || err.response?.data?.message || "Failed to save route",
      );
    } finally {
      setLoading(false);
    }
  };

  // const handleEdit = (route) => {
  //   setEditingRouteId(route._id);
  //   setForm({
  //     source: route.source,
  //     destination: route.destination,
  //     via: route.via || "",
  //     distance: route.distance || "",
  //     estimatedDuration: route.estimatedDuration || "",
  //     trips: route.trips || [
  //       {
  //         sourceTime: "",
  //         destinationTime: "",
  //         stops: [],
  //       },
  //     ],
  //   });
  //   setCurrentTripIndex(0);
  //   setShowForm(true);
  //   window.scrollTo({ top: 0, behavior: "smooth" });
  // };
  const handleEdit = (route) => {
    setEditingRouteId(route._id);

    // ✅ DEEP COPY (VERY IMPORTANT)
    const deepTrips = JSON.parse(
      JSON.stringify(
        route.trips || [
          {
            sourceTime: "",
            destinationTime: "",
            stops: [],
          },
        ],
      ),
    );

    setForm({
      source: route.source,
      destination: route.destination,
      via: route.via || "",
      distance: route.distance || "",
      estimatedDuration: route.estimatedDuration || "",
      trips: deepTrips, // ✅ FIXED
    });

    setCurrentTripIndex(0);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await axiosInstance.delete(`/api/routes/${id}`);
      toast.success("Route deleted successfully");
      fetchRoutes();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete route");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      source: "",
      destination: "",
      via: "",
      distance: "",
      estimatedDuration: "",
      trips: [
        {
          sourceTime: "",
          destinationTime: "",
          stops: [],
        },
      ],
    });
    setNewStop({
      name: "",
      timingOffset: "",
      latitude: "",
      longitude: "",
      stage: "",
      sequence: 0,
    });
    setEditingRouteId(null);
    setCurrentTripIndex(0);
    setCopiedTrip(null);
  };

  const filteredRoutes = routes.filter(
    (route) =>
      route.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (route.via && route.via.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Route Management</h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search routes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FiX size={18} />
                </button>
              )}
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FiPlus size={18} />
              <span>Add Route</span>
            </button>
          </div>
        </div>

        {/* Form Section */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="font-semibold text-gray-800">
                {editingRouteId ? "Edit Route" : "Add New Route"}
              </h2>
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Source *
                  </label>
                  <input
                    type="text"
                    name="source"
                    value={form.source}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="Enter source location"
                    list="sourceSuggestions"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Destination *
                  </label>
                  <input
                    type="text"
                    name="destination"
                    value={form.destination}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="Enter destination location"
                    list="destinationSuggestions"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Via (Optional)
                  </label>
                  <input
                    type="text"
                    name="via"
                    value={form.via}
                    onChange={handleInputChange}
                    placeholder="Via"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Distance (km)
                  </label>
                  <input
                    type="number"
                    name="distance"
                    value={form.distance}
                    onChange={handleInputChange}
                    placeholder="Distance in kilometers"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Duration (min)
                  </label>
                  <input
                    type="number"
                    name="estimatedDuration"
                    value={form.estimatedDuration}
                    onChange={handleInputChange}
                    placeholder="Duration in minutes"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Trips/Schedules
                  </h3>
                  <button
                    type="button"
                    onClick={addTrip}
                    className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm"
                  >
                    <FiPlus size={14} />
                    Add Trip
                  </button>
                </div>
                <div className="flex overflow-x-auto mb-4 border-b border-gray-200">
                  {form.trips.map((trip, index) => (
                    <div key={index} className="flex items-center">
                      <button
                        type="button"
                        onClick={() => setCurrentTripIndex(index)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 ${
                          currentTripIndex === index
                            ? "border-blue-500 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        Trip {index + 1}
                      </button>
                      <button
                        type="button"
                        onClick={() => copyTrip(index)}
                        className="text-gray-500 hover:text-gray-700 p-2"
                        title="Copy Trip"
                      >
                        <FiCopy size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => pasteTrip(index)}
                        className={`text-gray-500 hover:text-gray-700 p-2 ${
                          !copiedTrip ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        title="Paste Trip"
                        disabled={!copiedTrip}
                      >
                        <FiClipboard size={14} />
                      </button>
                      {form.trips.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeTrip(index);
                          }}
                          className="text-gray-400 hover:text-red-500 p-2"
                        >
                          <FiX size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Departure Time *
                    </label>
                    <input
                      type="time"
                      name="sourceTime"
                      value={form.trips[currentTripIndex].sourceTime || ""}
                      onChange={(e) => handleTripChange(e, currentTripIndex)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Arrival Time *
                    </label>
                    <input
                      type="time"
                      name="destinationTime"
                      value={form.trips[currentTripIndex].destinationTime || ""}
                      onChange={(e) => handleTripChange(e, currentTripIndex)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                <div className="pt-6 border-t border-gray-200">
                  <h4 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-blue-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Stops for Trip {currentTripIndex + 1}
                  </h4>
                  {
                  /* Edit All Stops Button */}
<button
  type="button"
  onClick={() => {
    const original = form.trips[currentTripIndex].stops;

    // ✅ FULLY ISOLATED COPY (NO REFERENCE)
    const editable = original.map((s) => ({
      name: s.name || "",
      timingOffset: s.timingOffset || "",
      latitude: s.latitude || "",
      longitude: s.longitude || "",
      stage: s.stage || "",
      sequence: s.sequence || 0,
    }));

    const backup = original.map((s) => ({
      name: s.name || "",
      timingOffset: s.timingOffset || "",
      latitude: s.latitude || "",
      longitude: s.longitude || "",
      stage: s.stage || "",
      sequence: s.sequence || 0,
    }));

    setBulkStops(editable);
    setOriginalStopsBackup(backup);
    setEditAllMode(true);
  }}
  className="mb-3 bg-blue-600 hover:bg-blue-800 text-white px-3 py-1 rounded"
>
  Edit All Stops
</button>

{/* Edit Table */}
{editAllMode && (
  <div className="bg-white p-4 rounded-lg mb-4 border border-gray-200 shadow-sm">
    <h5 className="text-md font-semibold text-gray-800 mb-3">
      Edit All Stops
    </h5>

    <div className="overflow-x-auto">
      <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Seq</th>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Time</th>
            <th className="p-2 border">Stage</th>
            <th className="p-2 border">Lat</th>
            <th className="p-2 border">Lng</th>
          </tr>
        </thead>

        <tbody>
          {bulkStops.map((stop, index) => (
            <tr key={index}>
              <td className="p-2 border text-center">
                {index + 1}
              </td>

              {/* NAME */}
              <td className="p-2 border">
                <input
                  value={stop.name}
                  onChange={(e) => {
                    setBulkStops((prev) =>
                      prev.map((s, i) =>
                        i === index
                          ? { ...s, name: e.target.value }
                          : s
                      )
                    );
                  }}
                  className="w-full p-1 border rounded"
                />
              </td>

              {/* TIME */}
              <td className="p-2 border">
                <input
                  value={stop.timingOffset}
                  onChange={(e) => {
                    setBulkStops((prev) =>
                      prev.map((s, i) =>
                        i === index
                          ? { ...s, timingOffset: e.target.value }
                          : s
                      )
                    );
                  }}
                  className="w-full p-1 border rounded"
                />
              </td>

              {/* STAGE */}
              <td className="p-2 border">
                <input
                  type="number"
                  value={stop.stage}
                  onChange={(e) => {
                    setBulkStops((prev) =>
                      prev.map((s, i) =>
                        i === index
                          ? { ...s, stage: e.target.value }
                          : s
                      )
                    );
                  }}
                  className="w-full p-1 border rounded"
                />
              </td>

              {/* LAT */}
              <td className="p-2 border">
                <input
                  value={stop.latitude}
                  onChange={(e) => {
                    setBulkStops((prev) =>
                      prev.map((s, i) =>
                        i === index
                          ? { ...s, latitude: e.target.value }
                          : s
                      )
                    );
                  }}
                  className="w-full p-1 border rounded"
                />
              </td>

              {/* LNG */}
              <td className="p-2 border">
                <input
                  value={stop.longitude}
                  onChange={(e) => {
                    setBulkStops((prev) =>
                      prev.map((s, i) =>
                        i === index
                          ? { ...s, longitude: e.target.value }
                          : s
                      )
                    );
                  }}
                  className="w-full p-1 border rounded"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* BUTTONS */}
    <div className="mt-4 flex gap-3">
      
      {/* SAVE */}
      <button
        onClick={() => {
          const updatedTrips = form.trips.map((trip, i) => {
            if (i !== currentTripIndex) return trip;

            return {
              ...trip,
              stops: bulkStops.map((s, idx) => ({
                name: s.name,
                timingOffset: s.timingOffset,
                latitude: s.latitude,
                longitude: s.longitude,
                stage: Number(s.stage),
                sequence: idx + 1,
              })),
            };
          });

          setForm((prev) => ({
            ...prev,
            trips: updatedTrips,
          }));

          setEditAllMode(false);
        }}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Save All Changes
      </button>

      {/* CANCEL */}
      <button
        onClick={() => {
          setBulkStops(
            originalStopsBackup.map((s) => ({ ...s }))
          );
          setEditAllMode(false);
        }}
        className="bg-gray-300 px-4 py-2 rounded"
      >
        Cancel
      </button>
    </div>
  </div>
)}
                <div className="bg-blue-50 p-4 rounded-lg mb-5 border border-blue-100">
                    <h5 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Add New Stop
                    </h5>
                    {insertMessage && (
                      <div className="mb-2 text-sm text-green-700 bg-green-100 px-3 py-2 rounded">
                        {insertMessage}
                        <button
                          type="button"
                          onClick={() => {
                            setInsertIndex(null);
                            setInsertMode(null);
                            setInsertMessage("");
                          }}
                          className="ml-3 text-red-600"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Stop Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          ref={stopNameRef}
                          value={newStop.name}
                          onChange={handleStopChange}
                          placeholder="e.g., Central Station"
                          className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Timing Offset *
                        </label>
                        <input
                          type="text"
                          name="timingOffset"
                          value={newStop.timingOffset}
                          onChange={handleStopChange}
                          placeholder="e.g., +30 mins"
                          className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Stage *
                        </label>
                        <input
                          type="number"
                          name="stage"
                          value={newStop.stage}
                          onChange={handleStopChange}
                          placeholder="Enter stage (e.g., 4)"
                          className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Latitude *
                        </label>
                        <input
                          type="text"
                          name="latitude"
                          value={newStop.latitude}
                          onChange={handleStopChange}
                          placeholder="e.g., 40.7128"
                          className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Longitude*
                        </label>
                        <input
                          type="text"
                          name="longitude"
                          value={newStop.longitude}
                          onChange={handleStopChange}
                          placeholder="e.g., -74.0060"
                          className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              newStop.editingIndex !== undefined &&
                              newStop.editingIndex !== null
                            ) {
                              const updatedTrips = [...form.trips];

                              updatedTrips[currentTripIndex].stops[
                                newStop.editingIndex
                              ] = {
                                name: newStop.name,
                                timingOffset: newStop.timingOffset,
                                latitude: newStop.latitude || "",
                                longitude: newStop.longitude || "",
                                stage: Number(newStop.stage), // ✅ FIX
                                sequence: Number(newStop.sequence),
                              };

                              setForm({ ...form, trips: updatedTrips });
                              toast.success("Stop updated successfully");
                            } else {
                              addStop();
                            }

                            // ✅ IMPORTANT RESET (stage must be included)
                            setNewStop({
                              name: "",
                              timingOffset: "",
                              latitude: "",
                              longitude: "",
                              stage: "",
                              sequence: 0,
                              editingIndex: null,
                            });
                          }}
                          disabled={
                            !newStop.name ||
                            !newStop.timingOffset ||
                            !newStop.stage === "" ||
                            newStop.latitude === "" ||
                            newStop.longitude === ""
                          }
                          className={`w-full px-4 py-2.5 rounded-md text-sm font-medium ${
                            !newStop.name || !newStop.timingOffset
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                          }`}
                        >
                          {newStop.editingIndex !== undefined &&
                          newStop.editingIndex !== null
                            ? "Update Stop"
                            : "Add Stop"}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-60 overflow-y-auto">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="text-sm font-medium text-gray-700">
                        Stops ({form.trips[currentTripIndex].stops.length})
                      </h5>
                      {form.trips[currentTripIndex].stops.length > 0 && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          Drag to reorder
                        </span>
                      )}
                    </div>
                    {form.trips[currentTripIndex].stops.length > 0 ? (
                      <ul className="divide-y divide-gray-200">
                        {form.trips[currentTripIndex].stops
                          .sort((a, b) => a.sequence - b.sequence)
                          .map((stop, index) => (
                            <li
                              key={index}
                              className="py-3 flex justify-between items-center hover:bg-gray-100 px-2 rounded-lg transition-colors"
                            >
                              <div className="flex items-start">
                                <span className="h-6 w-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium mt-0.5 mr-3">
                                  {index + 1}
                                </span>
                                <div>
                                  <span className="font-medium block">
                                    {stop.name} (Stage {stop.stage})
                                  </span>
                                  <span className="text-gray-600 text-sm flex items-center mt-1">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4 mr-1"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    {stop.timingOffset}
                                  </span>
                                  {(stop.latitude || stop.longitude) && (
                                    <span className="text-gray-500 text-xs flex items-center mt-1">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-3 w-3 mr-1"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                      {stop.latitude}, {stop.longitude}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setNewStop({
                                      ...stop,
                                      editingIndex: index,
                                    });
                                    toast.info("Editing stop...");
                                  }}
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-md transition-colors"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-1"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                  </svg>
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeStop(index)}
                                  className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-md transition-colors"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-1"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  Remove
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setInsertIndex(index);
                                    setInsertMode("above");
                                    setInsertMessage(
                                      `Adding stop ABOVE ${stop.name}`,
                                    );

                                    setTimeout(() => {
                                      stopNameRef.current?.focus();
                                    }, 100);
                                  }}
                                  className="text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded"
                                >
                                  + Above
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setInsertIndex(index);
                                    setInsertMode("below");
                                    setInsertMessage(
                                      `Adding stop BELOW ${stop.name}`,
                                    );

                                    setTimeout(() => {
                                      stopNameRef.current?.focus();
                                    }, 100);
                                  }}
                                  className="text-purple-600 text-sm font-medium bg-purple-50 px-2 py-1 rounded"
                                >
                                  + Below
                                </button>
                              </div>
                            </li>
                          ))}
                      </ul>
                    ) : (
                      <div className="text-center py-6">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-12 w-12 mx-auto text-gray-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <p className="text-gray-400 text-sm mt-2">
                          No stops added yet for this trip
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          Add your first stop using the form above
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Processing..."
                    : editingRouteId
                      ? "Update Route"
                      : "Add Route"}
                </button>
              </div>
            </form>
          </div>
        )}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-800">All Routes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Via
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trips
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stops
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx}>
                      {Array.from({ length: 5 }).map((_, colIdx) => (
                        <td
                          key={colIdx}
                          className="px-6 py-4 whitespace-nowrap"
                        >
                          <Skeleton height={20} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredRoutes.length > 0 ? (
                  filteredRoutes.map((route) => (
                    <tr key={route._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {route.source} → {route.destination}
                        </div>
                        <div className="text-sm text-gray-500">
                          {route.distance && `${route.distance} km`}
                          {route.estimatedDuration &&
                            ` • ${route.estimatedDuration} min`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {route.via || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="space-y-1">
                          {route.trips?.map((trip, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              <FiClock className="text-gray-400 flex-shrink-0" />
                              <div>
                                {trip.sourceTime} - {trip.destinationTime}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {route.trips?.[0]?.stops?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {route.trips[0].stops
                              .sort((a, b) => a.sequence - b.sequence)
                              .slice(0, route.trips[0].stops.length)
                              .map((stop, i) => (
                                <span
                                  key={i}
                                  className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs"
                                >
                                  {stop.name}
                                </span>
                              ))}
                            {/* { route.trips[0].stops.length > 3 && (
                              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                +{route.trips[0].stops.length - 3} more
                              </span>
                            )} */}
                          </div>
                        ) : (
                          <span className="text-gray-400">No stops</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(route)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <FiEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(route._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      {searchTerm
                        ? "No routes match your search"
                        : "No routes found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ManageRoutes;
