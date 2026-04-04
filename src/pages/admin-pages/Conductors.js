import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiX, FiEye, FiEyeOff } from "react-icons/fi";
import AdminLayout from "./AdminLayout";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import axiosInstance from "../../utils/axiosInstance";

const ManageConductors = () => {
    const [form, setForm] = useState({
        batch_no: "",
        name: "",
        password: "",
        type: "Temporary", // default value
    });
    const [conductors, setConductors] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const fetchConductors = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get("/conductors");
            setConductors(res.data);
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to fetch conductors"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConductors();
    }, []);

    // Hide password when form closes
    useEffect(() => {
        if (!showForm) setShowPassword(false);
    }, [showForm]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            if (editingId) {
                // update only name, type + optional password
                const updateData = { name: form.name, type: form.type };
                if (form.password) updateData.password = form.password;

                await axiosInstance.put(`/conductors/${editingId}`, updateData);
                toast.success("Conductor updated successfully");
            } else {
                await axiosInstance.post("/conductors/register", form);
                toast.success("Conductor added successfully");
            }
            resetForm();
            fetchConductors();
            setShowForm(false);
        } catch (err) {
            toast.error(err.response?.data?.message || "Operation failed");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (conductor) => {
        setForm({
            batch_no: conductor.batch_no,
            name: conductor.name,
            password: "", // left empty, optional for update
            type: conductor.type || "Temporary",
        });
        setEditingId(conductor._id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        try {
            setLoading(true);
            await axiosInstance.delete(`/conductors/${id}`);
            toast.success("Conductor deleted successfully");
            fetchConductors();
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to delete conductor"
            );
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setForm({ batch_no: "", name: "", password: "", type: "Temporary" });
        setEditingId(null);
    };

    const filteredConductors = conductors.filter(
        (c) =>
            c.batch_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h1 className="text-2xl font-bold text-gray-800">
                        Conductor Management
                    </h1>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search conductors..."
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
                            <span>Add Conductor</span>
                        </button>
                    </div>
                </div>

                {/* Form */}
                {showForm && (
                    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <h2 className="font-semibold text-gray-800">
                                {editingId
                                    ? "Edit Conductor"
                                    : "Add New Conductor"}
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
                                    Batch No *
                                </label>
                                <input
                                    type="text"
                                    name="batch_no"
                                    value={form.batch_no}
                                    onChange={handleChange}
                                    placeholder="Enter batch number"
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    required
                                    disabled={!!editingId} // batch_no should not be editable
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Enter full name"
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            {/* Dropdown for type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Conductor Type *
                                </label>
                                <select
                                    name="type"
                                    value={form.type}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="Permanent">Permanent</option>
                                    <option value="Temporary">Temporary</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {editingId
                                        ? "New Password (optional)"
                                        : "Password *"}
                                </label>

                                <div className="relative">
                                    <input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        placeholder="Enter password"
                                        className="w-full p-2 pr-10 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        required={!editingId}
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? (
                                            <FiEyeOff size={18} />
                                        ) : (
                                            <FiEye size={18} />
                                        )}
                                    </button>
                                </div>
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
                                        ? "Update Conductor"
                                        : "Add Conductor"}
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
                            All Conductors
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Batch No
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
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
                                ) : filteredConductors.length > 0 ? (
                                    filteredConductors.map((c) => (
                                        <tr
                                            key={c._id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {c.batch_no}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {c.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {c.type}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() =>
                                                            handleEdit(c)
                                                        }
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="Edit"
                                                    >
                                                        <FiEdit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(c._id)
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
                                                ? "No conductors match your search"
                                                : "No conductors found"}
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

export default ManageConductors;