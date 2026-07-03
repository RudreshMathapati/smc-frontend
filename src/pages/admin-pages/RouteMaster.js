import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiX } from "react-icons/fi";
import AdminLayout from "./AdminLayout";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import axiosInstance from "../../utils/axiosInstance";

const RouteMaster = () => {
    const [form, setForm] = useState({
        source: "",
        destination: "",
        routeId: "",
    });
    const [entries, setEntries] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchEntries = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get("/api/route-master");
            setEntries(res.data);
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to fetch route master data"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEntries();
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
                await axiosInstance.put(`/api/route-master/${editingId}`, form);
                toast.success("Route master entry updated successfully");
                alert("Route master entry updated successfully");
            } else {
                await axiosInstance.post("/api/route-master", form);
                toast.success("Route master entry added successfully");
            }
            resetForm();
            fetchEntries();
            setShowForm(false);
        } catch (err) {
            toast.error(err.response?.data?.message || "Operation failed");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (entry) => {
        setForm({
            source: entry.source,
            destination: entry.destination,
            routeId: entry.routeId,
        });
        setEditingId(entry._id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        try {
            setLoading(true);
            await axiosInstance.delete(`/api/route-master/${id}`);
            toast.success("Route master entry deleted successfully");
            fetchEntries();
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to delete entry"
            );
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setForm({ source: "", destination: "", routeId: "" });
        setEditingId(null);
    };

    const filteredEntries = entries.filter(
        (e) =>
            e.source?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.routeId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h1 className="text-2xl font-bold text-gray-800">
                        Route Master
                    </h1>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
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

                {/* Form */}
                {showForm && (
                    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <h2 className="font-semibold text-gray-800">
                                {editingId
                                    ? "Edit Route Master Entry"
                                    : "Add New Route Master Entry"}
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
                            className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4"
                        >
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Source *
                                </label>
                                <input
                                    type="text"
                                    name="source"
                                    value={form.source}
                                    onChange={handleChange}
                                    placeholder="Enter source"
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    required
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
                                    onChange={handleChange}
                                    placeholder="Enter destination"
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Route ID *
                                </label>
                                <input
                                    type="text"
                                    name="routeId"
                                    value={form.routeId}
                                    onChange={handleChange}
                                    placeholder="Enter route ID"
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div className="flex items-end gap-3 md:col-span-3">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading
                                        ? "Processing..."
                                        : editingId
                                        ? "Update Entry"
                                        : "Add Entry"}
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

                {/* Table */}
                <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <h2 className="font-semibold text-gray-800">
                            All Route Master Entries
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Source
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Destination
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Route ID
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
                                            {Array.from({ length: 4 }).map(
                                                (_, colIdx) => (
                                                    <td
                                                        key={colIdx}
                                                        className="px-6 py-4 whitespace-nowrap"
                                                    >
                                                        <Skeleton height={20} />
                                                    </td>
                                                )
                                            )}
                                        </tr>
                                    ))
                                ) : filteredEntries.length > 0 ? (
                                    filteredEntries.map((entry) => (
                                        <tr
                                            key={entry._id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {entry.source}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {entry.destination}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {entry.routeId}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() =>
                                                            handleEdit(entry)
                                                        }
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="Edit"
                                                    >
                                                        <FiEdit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(entry._id)
                                                        }
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
                                                ? "No entries match your search"
                                                : "No route master entries found"}
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

export default RouteMaster;
