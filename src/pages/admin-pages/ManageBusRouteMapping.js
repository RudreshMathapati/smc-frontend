import React, { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { toast } from "react-toastify";
// import moment from "moment";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import axiosInstance from "../../utils/axiosInstance";

const ManageBusRouteMapping = () => {
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState({
    buses: true,
    routes: true,
    mappings: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    bus: "",
    route: "",
    timings: [""],
    status: "Active",
    remarks: "",
  });

  const [editingId, setEditingId] = useState(null);

  const fetchAll = async () => {
    try {
      setLoading({ buses: true, routes: true, mappings: true });

      const [busRes, routeRes, mapRes] = await Promise.all([
        axiosInstance.get(`/api/buses`),
        axiosInstance.get(`/api/routes`),
        axiosInstance.get(`/api/bus-routes-mapping`),
      ]);

      setBuses(busRes.data);
      setRoutes(routeRes.data);
      setMappings(mapRes.data);
      console.log(mapRes.data,"MspRes Data");

      setLoading({ buses: false, routes: false, mappings: false });
    } catch (error) {
      toast.error("Error fetching data");
      console.error(error);
      setLoading({ buses: false, routes: false, mappings: false });
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleTimingChange = (index, value) => {
    const newTimings = [...form.timings];
    newTimings[index] = value;
    setForm({ ...form, timings: newTimings });
  };

  const addTimingField = () => {
    setForm({ ...form, timings: [...form.timings, ""] });
  };

  const removeTimingField = (index) => {
    if (form.timings.length <= 1) return;
    const newTimings = [...form.timings];
    newTimings.splice(index, 1);
    setForm({ ...form, timings: newTimings });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.bus || !form.route || form.timings.some((t) => !t.trim())) {
      return toast.warning("Please fill in all required fields and timings");
    }

    setIsSubmitting(true);

    try {
      if (editingId) {
        await axiosInstance.put(`/api/bus-routes-mapping/${editingId}`, form);
        toast.success("Mapping updated successfully");
      } else {
        await axiosInstance.post(`/api/bus-routes-mapping`, form);
        toast.success("Mapping created successfully");
      }

      resetForm();
      await fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save mapping");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      bus: "",
      route: "",
      timings: [""],
      status: "Active",
      remarks: "",
    });
    setEditingId(null);
  };

  const handleEdit = (mapping) => {
    // console.log(mapping,"Inside handle Mapping");
    setForm({
      bus: mapping.bus._id,
      route: mapping.route._id,
      timings: mapping.timings || [""],
      status: mapping.status || "Active",
      remarks: mapping.remarks || "",
    });
    setEditingId(mapping._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
      try {
        await axiosInstance.delete(`/api/bus-routes-mapping/${id}`);
        toast.success("Mapping deleted successfully");
        fetchAll();
      } catch (err) {
        toast.error("Failed to delete mapping");
        console.error(err);
    }
  };

  // const isLoading = loading.buses || loading.routes || loading.mappings;

  return (
    <AdminLayout>
      <div className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Bus ↔ Route Mapping
          </h1>
        </div>

        {/* Mapping Form */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            {editingId ? "Edit Mapping" : "Create New Mapping"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Bus Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Bus *
                </label>
                {loading.buses ? (
                  <Skeleton height={40} />
                ) : (
                  <select
                    value={form.bus}
                    onChange={(e) => setForm({ ...form, bus: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isSubmitting}
                  >
                    <option value="">-- Select Bus --</option>
                    {buses.map((bus) => (
                      <option key={bus._id} value={bus._id}>
                        {bus.busNumber} - {bus.registrationNumber}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Route Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Route *
                </label>
                {loading.routes ? (
                  <Skeleton height={40} />
                ) : (
                  <select
                    value={form.route}
                    onChange={(e) =>
                      setForm({ ...form, route: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isSubmitting}
                  >
                    <option value="">-- Select Route --</option>
                    {routes.map((route) => (
                      <option key={route._id} value={route._id}>
                        {route.source} → {route.destination}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSubmitting}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks
                </label>
                <input
                  type="text"
                  placeholder="Optional remarks"
                  value={form.remarks}
                  onChange={(e) =>
                    setForm({ ...form, remarks: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Timings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timings *
              </label>
              <div className="space-y-2">
                {form.timings.map((time, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={time}
                      onChange={(e) =>
                        handleTimingChange(index, e.target.value)
                      }
                      placeholder="e.g. 08:00 AM"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isSubmitting}
                      required
                    />
                    {form.timings.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTimingField(index)}
                        className="p-2 text-red-600 hover:text-red-800 disabled:opacity-50"
                        disabled={isSubmitting}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTimingField}
                  className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Add another timing
                </button>
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="submit"
                className={`px-4 py-2 rounded-md text-white font-medium ${
                  isSubmitting ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                } transition-colors flex items-center`}
                disabled={isSubmitting}
              >
                {isSubmitting && (
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
                {editingId ? "Update Mapping" : "Create Mapping"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Mappings Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-4 py-3 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Current Mappings
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              List of all bus to route mappings
            </p>
          </div>

          {loading.mappings ? (
            <div className="p-4 md:p-6">
              <Skeleton count={5} height={50} className="mb-2" />
            </div>
          ) : mappings.length === 0 ? (
            <div className="p-8 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  vectorEffect="non-scaling-stroke"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No mappings found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new bus to route mapping.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Bus
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Route
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Timings
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Remarks
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mappings.map((map) => (
                    <tr key={map._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {map.bus?.busNumber}
                        </div>
                        <div className="text-sm text-gray-500">
                          {map.bus?.registrationNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {map.route?.source} → {map.route?.destination}
                        </div>
                        <div className="text-sm text-gray-500">
                          {map.route?.distance} km
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 space-y-1">
                          {map.timings?.map((time, i) => (
                            <div
                              key={i}
                              className="bg-blue-50 text-blue-800 px-2 py-1 rounded text-xs inline-block mr-1"
                            >
                              {time}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            map.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : map.status === "Inactive"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {map.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {map.remarks || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(map)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(map._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ManageBusRouteMapping;
