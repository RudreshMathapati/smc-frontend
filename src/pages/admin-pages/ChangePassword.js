// import React, { useState } from "react";
// import AdminLayout from "./AdminLayout";
// import axiosInstance from "../../utils/axiosInstance";
// import { toast } from "react-toastify";

// const ChangePassword = () => {
//   const [form, setForm] = useState({
//     currentPassword: "",
//     newPassword: "",
//     confirmPassword: "",
//   });

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async () => {
//     try {
//       if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
//         return toast.error("All fields are required");
//       }

//       if (form.newPassword !== form.confirmPassword) {
//         return toast.error("Passwords do not match");
//       }

//       const userId = localStorage.getItem("userId"); // or from auth

//       await axiosInstance.put("/api/auth/change-password", {
//         userId,
//         ...form,
//       });

//       toast.success("Password updated successfully");

//       setForm({
//         currentPassword: "",
//         newPassword: "",
//         confirmPassword: "",
//       });
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Error updating password");
//     }
//   };

//   return (
//     <AdminLayout>
//       <div className="max-w-md mx-auto mt-10 bg-white shadow-lg rounded-xl p-6">
//         <h2 className="text-2xl font-bold mb-6 text-center">
//           Change Password
//         </h2>

//         <div className="space-y-4">
//           <input
//             type="password"
//             name="currentPassword"
//             placeholder="Current Password"
//             value={form.currentPassword}
//             onChange={handleChange}
//             className="w-full border p-3 rounded"
//           />

//           <input
//             type="password"
//             name="newPassword"
//             placeholder="New Password"
//             value={form.newPassword}
//             onChange={handleChange}
//             className="w-full border p-3 rounded"
//           />

//           <input
//             type="password"
//             name="confirmPassword"
//             placeholder="Confirm Password"
//             value={form.confirmPassword}
//             onChange={handleChange}
//             className="w-full border p-3 rounded"
//           />

//           <button
//             onClick={handleSubmit}
//             className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700"
//           >
//             Update Password
//           </button>
//         </div>
//       </div>
//     </AdminLayout>
//   );
// };

// export default ChangePassword;

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
      <div className="max-w-md mx-auto mt-10 bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Change Password
        </h2>

        <div className="space-y-4">
          <input
            type="password"
            name="currentPassword"
            placeholder="Current Password"
            value={form.currentPassword}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          />

          <input
            type="password"
            name="newPassword"
            placeholder="New Password"
            value={form.newPassword}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          />

          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700"
          >
            Update Password
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ChangePassword;