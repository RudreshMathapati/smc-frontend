import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { toast } from "react-toastify";
import moment from "moment";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import axiosInstance from "../../utils/axiosInstance";

const ManageBusPosMapping = () => {
  const [buses, setBuses] = useState([]);
  const [posDevices, setPosDevices] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState({
    buses: true,
    posDevices: true,
    assignments: true,
  });
  const [form, setForm] = useState({
    busId: "",
    posDeviceId: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAllBuses = async () => {
    try {
      const res = await axiosInstance.get(`/buses`);
      setBuses(res.data);
      setLoading((prev) => ({ ...prev, buses: false }));
    } catch (error) {
      console.error("Error fetching buses:", error.message);
      toast.error("Failed to load buses");
      setLoading((prev) => ({ ...prev, buses: false }));
    }
  };

  const fetchAllPosMachines = async () => {
    try {
      const res = await axiosInstance.get(`/pos-machines`);
      setPosDevices(res.data);
      setLoading((prev) => ({ ...prev, posDevices: false }));
    } catch (error) {
      console.error("Error fetching POS devices:", error.message);
      toast.error("Failed to load POS devices");
      setLoading((prev) => ({ ...prev, posDevices: false }));
    }
  };

  const fetchAllBusPosMappings = async () => {
    try {
      const res = await axiosInstance.get(`/bus-pos-mapping`);
      setAssignments(res.data.data);
      setLoading((prev) => ({ ...prev, assignments: false }));
    } catch (error) {
      console.error("Error fetching assignments:", error.message);
      toast.error("Failed to load assignments");
      setLoading((prev) => ({ ...prev, assignments: false }));
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.busId || !form.posDeviceId) {
      return toast.warning("Please select both Bus and POS device");
    }

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await axiosInstance.put(`/bus-pos-mapping/${editingId}`, form);
        toast.success("Assignment updated successfully");
      } else {
        await axiosInstance.post(`/bus-pos-mapping`, form);
        toast.success("Assignment created successfully");
      }
      setForm({ busId: "", posDeviceId: "" });
      setIsEditing(false);
      setEditingId(null);
      await fetchAllBusPosMappings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save assignment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (assignment) => {
    setForm({
      busId: assignment.bus._id,
      posDeviceId: assignment.posMachine._id,
    });
    setEditingId(assignment._id);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
      try {
        await axiosInstance.delete(`/bus-pos-mapping/${id}`);
        toast.success("Assignment deleted successfully");
        fetchAllBusPosMappings();
      } catch (err) {
        toast.error("Failed to delete assignment");
    }
  };

  useEffect(() => {
    fetchAllBuses();
    fetchAllPosMachines();
    fetchAllBusPosMappings();
  }, []);

  // const isLoading = loading.buses || loading.posDevices || loading.assignments;

  return (
    <AdminLayout>
      <div className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Bus ↔ POS Device Mapping
          </h1>
        </div>

        {/* Assignment Form */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            {isEditing ? "Edit Assignment" : "Create New Assignment"}
          </h2>
          <form
            onSubmit={handleSubmit}
            className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Bus
              </label>
              {loading.buses ? (
                <Skeleton height={40} />
              ) : (
                <select
                  name="busId"
                  value={form.busId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSubmitting}
                >
                  <option value="">-- Select Bus --</option>
                  {buses.map((bus) => (
                    <option key={bus._id} value={bus._id}>
                      {bus.busNumber} ({bus.registrationNumber})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select POS Device
              </label>
              {loading.posDevices ? (
                <Skeleton height={40} />
              ) : (
                <select
                  name="posDeviceId"
                  value={form.posDeviceId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSubmitting}
                >
                  <option value="">-- Select POS Device --</option>
                  {posDevices.map((pos) => (
                    <option key={pos._id} value={pos._id}>
                      {pos.deviceId}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="md:col-span-2 flex space-x-3 pt-2">
              <button
                type="submit"
                className={`px-4 py-2 rounded-md text-white font-medium ${
                  isSubmitting ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                } transition-colors`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
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
                    Processing...
                  </span>
                ) : isEditing ? (
                  "Update Assignment"
                ) : (
                  "Create Assignment"
                )}
              </button>

              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditingId(null);
                    setForm({ busId: "", posDeviceId: "" });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Assignments Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-4 py-3 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Current Assignments
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              List of all bus to POS device mappings
            </p>
          </div>

          {loading.assignments ? (
            <div className="p-4 md:p-6">
              <Skeleton count={5} height={50} className="mb-2" />
            </div>
          ) : assignments.length === 0 ? (
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
                No assignments
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new bus to POS device assignment.
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
                      Bus Number
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Registration
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      POS Device
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Assignment Date
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
                  {assignments.map((a) => (
                    <tr key={a._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {a.bus?.busNumber || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {a.bus?.registrationNumber || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {a.posMachine?.deviceId || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {moment(a.assignedAt).format("DD MMM YYYY")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(a)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(a._id)}
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

export default ManageBusPosMapping;
