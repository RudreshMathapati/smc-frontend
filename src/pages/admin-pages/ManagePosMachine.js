import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiX } from "react-icons/fi";
import AdminLayout from "./AdminLayout";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import axiosInstance from "../../utils/axiosInstance";

const ManagePOSMachines = () => {
 const [form, setForm] = useState({
  name: "",       // This is the number like 001
  deviceId: "",
  model: "",
  vendor: "",
});
  const [posMachines, setPosMachines] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchPOSMachines = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/api/pos-machines");
      setPosMachines(res.data);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to fetch POS machines"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPOSMachines();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingId) {
        await axiosInstance.put(
          `/api/pos-machines/${editingId}`,
          form
        );
        toast.success("POS Machine updated successfully");
      } else {
        await axiosInstance.post("/api/pos-machines", form);
        toast.success("POS Machine added successfully");
      }
      resetForm();
      fetchPOSMachines();
      setShowForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (machine) => {
    setForm({
      name: machine.posName,
      deviceId: machine.deviceId,
      model: machine.model,
      vendor: machine.vendor,
    });
    setEditingId(machine._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await axiosInstance.delete(`/api/pos-machines/${id}`);
      toast.success("POS Machine deleted successfully");
      fetchPOSMachines();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to delete POS Machine"
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      deviceId: "",
      model: "",
      vendor: "",
    });
    setEditingId(null);
  };

  const filteredMachines = posMachines.filter(
    (machine) =>
      machine.deviceId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.vendor?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-800">
            POS Machine Management
          </h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search POS machines..."
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
              <span>Add POS</span>
            </button>
          </div>
        </div>

        {/* Form Section */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="font-semibold text-gray-800">
                {editingId ? "Edit POS Machine" : "Add New POS Machine"}
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
            <form
              onSubmit={handleSubmit}
              className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    POS Name *
  </label>
  <div className="flex">
    <span className="bg-gray-100 border border-r-0 px-3 py-2 rounded-l-md">
      SMT-ETM-
    </span>
    <input
      type="number"
      name="name"
      value={form.name}
      onChange={handleChange}
      placeholder="001"
      className="w-full p-2 border border-gray-300 rounded-r-md"
      required
    />
  </div>
</div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Device ID *
                </label>
                <input
                  type="text"
                  name="deviceId"
                  value={form.deviceId}
                  onChange={handleChange}
                  placeholder="Enter device ID"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model *
                </label>
                <input
                  type="text"
                  name="model"
                  value={form.model}
                  onChange={handleChange}
                  placeholder="Enter model"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendor *
                </label>
                <input
                  type="text"
                  name="vendor"
                  value={form.vendor}
                  onChange={handleChange}
                  placeholder="Enter vendor"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex items-end gap-3 md:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Processing..."
                    : editingId
                    ? "Update POS Machine"
                    : "Add POS Machine"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* POS Machines Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-800">All POS Machines</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Device ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Model
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
  POS Name
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
                      {Array.from({ length: 4 }).map((_, colIdx) => (
                        <td
                          key={colIdx}
                          className="px-6 py-4 whitespace-nowrap"
                        >
                          <Skeleton height={20} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredMachines.length > 0 ? (
                  filteredMachines.map((pos) => (
                    <tr key={pos._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {pos.deviceId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {pos.model}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {pos.vendor}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
  {pos.posName}
</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(pos)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <FiEdit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(pos._id)}
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
                      colSpan="4"
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      {searchTerm
                        ? "No POS machines match your search"
                        : "No POS machines found"}
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

export default ManagePOSMachines;
