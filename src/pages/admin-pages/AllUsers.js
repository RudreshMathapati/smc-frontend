import React, { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { toast } from "react-toastify";
import { FiSearch, FiX, FiUser } from "react-icons/fi";
import moment from "moment";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import axiosInstance from "../../utils/axiosInstance";

const AllUsers = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        setLoading(true);
        const userRes = await axiosInstance.get("/users");
        setAllUsers(userRes.data.allUsers);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch users");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllUsers();
  }, []);

  // const handleDelete = async (id) => {
  //   if (!window.confirm("Are you sure you want to delete this user?")) return;
  //   try {
  //     await axiosInstance.delete(`/users/${id}`);
  //     setAllUsers((prev) => prev.filter((user) => user._id !== id));
  //     toast.success("User deleted successfully");
  //   } catch (error) {
  //     toast.error(error.response?.data?.message || "Failed to delete user");
  //     console.error(error.message);
  //   }
  // };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const filteredUsers = allUsers.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.includes(searchTerm) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
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
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white shadow-md rounded-xl p-4">
                <div className="flex items-start gap-4">
                  <Skeleton circle width={48} height={48} />
                  <div className="flex-1">
                    <Skeleton width={120} height={20} className="mb-2" />
                    <Skeleton width={80} height={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <FiUser className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-gray-500">
              {searchTerm ? "No matching users found" : "No users registered yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <div
                key={user._id}
                className="bg-white shadow-md border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleViewDetails(user)}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="bg-blue-100 text-blue-600 w-12 h-12 flex items-center justify-center rounded-full text-xl font-semibold">
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {user.name || "Unnamed User"}
                      </h3>
                      <span className="text-xs text-gray-400">
                        {moment(user.createdAt).format("DD MMM YYYY")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 flex items-center gap-1">
                      <span>📞</span> {user.phone}
                    </p>
                    {user.email && (
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <span>📧</span> {user.email}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col items-end gap-2">
                    {/* <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(user._id);
                      }}
                      className="text-red-500 hover:text-red-700 transition p-1"
                      title="Delete"
                    >
                      <FiTrash2 size={18} />
                    </button> */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* User Detail Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">User Details</h2>
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FiX size={24} />
                  </button>
                </div>

                <div className="flex flex-col items-center mb-6">
                  <div className="bg-blue-100 text-blue-600 w-20 h-20 flex items-center justify-center rounded-full text-3xl font-semibold mb-4">
                    {selectedUser.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {selectedUser.name || "Unnamed User"}
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Phone</h4>
                    <p className="text-gray-800">{selectedUser.phone}</p>
                  </div>

                  {selectedUser.email && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Email</h4>
                      <p className="text-gray-800">{selectedUser.email}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Joined On</h4>
                    <p className="text-gray-800">
                      {moment(selectedUser.createdAt).format("MMMM Do YYYY, h:mm a")}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    {/* <button
                      onClick={() => {
                        handleDelete(selectedUser._id);
                        setShowUserModal(false);
                      }}
                      className="w-full bg-red-50 text-red-600 hover:bg-red-100 py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <FiTrash2 size={16} />
                      <span>Delete User</span>
                    </button> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AllUsers;