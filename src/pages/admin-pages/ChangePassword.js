import React, { useState } from "react";
import AdminLayout from "./AdminLayout";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const ChangePassword = () => {
  const user = useSelector((state) => state.auth.user);

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (!user?._id) {
        return toast.error("User not loaded. Please login again");
      }

      if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
        return toast.error("All fields are required");
      }

      if (form.newPassword !== form.confirmPassword) {
        return toast.error("Passwords do not match");
      }

      await axiosInstance.put("/api/auth/change-password", {
        userId: user._id, // ✅ FIX HERE
        ...form,
      });

      toast.success("Password updated successfully");

      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating password");
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-[420px] mx-auto mt-10 bg-white rounded-[24px] p-8 md:p-10 shadow-[0_20px_40px_rgba(0,0,0,0.06)] border border-[#e9ecef]">
        <h2 className="text-2xl font-bold mb-8 text-center text-[#212529]">
          Change Password
        </h2>

        <div className="space-y-6">
          <input
            type="password"
            name="currentPassword"
            placeholder="Current Password"
            value={form.currentPassword}
            onChange={handleChange}
            className="w-full pl-4 pr-4 py-3.5 rounded-xl border border-[#e9ecef] bg-[#f8f9fa] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0066CC]/20 focus:bg-white focus:border-[#0066CC]"
          />

          <input
            type="password"
            name="newPassword"
            placeholder="New Password"
            value={form.newPassword}
            onChange={handleChange}
            className="w-full pl-4 pr-4 py-3.5 rounded-xl border border-[#e9ecef] bg-[#f8f9fa] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0066CC]/20 focus:bg-white focus:border-[#0066CC]"
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            className="w-full pl-4 pr-4 py-3.5 rounded-xl border border-[#e9ecef] bg-[#f8f9fa] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0066CC]/20 focus:bg-white focus:border-[#0066CC]"
          />

          <button
            onClick={handleSubmit}
            className="w-full py-4 rounded-xl font-bold text-white transition-all duration-300 shadow-[0_4px_12px_rgba(0,102,204,0.2)] active:scale-[0.98] bg-[#0066CC] hover:bg-[#0052A3] hover:shadow-[0_6px_20px_rgba(0,102,204,0.3)]"
          >
            Update Password
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ChangePassword;