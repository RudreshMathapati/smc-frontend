// import React, { useEffect, useState } from "react";
// import AdminLayout from "./AdminLayout";
// import axiosInstance from "../../utils/axiosInstance";
// import { toast } from "react-toastify";

// const ConductorBusAssign = () => {
//   const [buses, setBuses] = useState([]);
//   const [conductors, setConductors] = useState([]);
//   const [assignments, setAssignments] = useState([]);

//   const [form, setForm] = useState({
//     busId: "",
//     conductorId: "",
//   });

//   const fetchData = async () => {
//     const busRes = await axiosInstance.get("/buses");
//     const conductorRes = await axiosInstance.get("/conductors");
//     const assignRes = await axiosInstance.get("/conductor-bus");

//     setBuses(busRes.data);
//     setConductors(conductorRes.data);
//     setAssignments(assignRes.data);
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const handleAssign = async () => {
//   try {
//     if (!form.busId || !form.conductorId) {
//       toast.error("Select bus and conductor");
//       return;
//     }

//     const bus = buses.find((b) => b._id === form.busId);
//     const conductor = conductors.find((c) => c._id === form.conductorId);

//     const res = await axiosInstance.post("/conductor-bus", {
//       busId: form.busId,
//       assignedbusNumber: bus.busNumber,
//       conductorId: form.conductorId,
//       batch_no: conductor.batch_no,
//       assignedDate: new Date().toISOString().split("T")[0],
//     });

//     toast.success(res.data.message || "Assigned successfully");
//     fetchData();
//   } catch (err) {
//     // 🔥 IMPORTANT PART
//     if (err.response && err.response.data && err.response.data.message) {
//       toast.error(err.response.data.message);
//     } else {
//       toast.error("Assignment failed");
//     }
//   }
// };

//   return (
//     <AdminLayout>
//       <div className="p-6 max-w-4xl mx-auto">
//         <h1 className="text-2xl font-bold mb-4">Assign Bus to Conductor</h1>

//         <div className="bg-white p-4 shadow rounded mb-6">
//           <div className="grid grid-cols-2 gap-4">
//             <select
//               className="border p-2"
//               onChange={(e) =>
//                 setForm({ ...form, busId: e.target.value })
//               }
//             >
//               <option value="">Select Bus</option>
//               {buses.map((bus) => (
//                 <option key={bus._id} value={bus._id}>
//                   {bus.busNumber}
//                 </option>
//               ))}
//             </select>

//             <select
//               className="border p-2"
//               onChange={(e) =>
//                 setForm({ ...form, conductorId: e.target.value })
//               }
//             >
//               <option value="">Select Conductor</option>
//               {conductors.map((c) => (
//                 <option key={c._id} value={c._id}>
//                   {c.name} ({c.batch_no})
//                 </option>
//               ))}
//             </select>
//           </div>

//           <button
//             onClick={handleAssign}
//             className="bg-blue-600 text-white px-4 py-2 mt-4 rounded"
//           >
//             Assign
//           </button>
//         </div>

//         {/* Assignment Table */}
//         <table className="w-full border">
//           <thead>
//             <tr className="bg-gray-100">
//               <th className="border p-2">Bus Number</th>
//               <th className="border p-2">Conductor</th>
//               <th className="border p-2">Batch No</th>
//               <th className="border p-2">Assigned Date</th>
//             </tr>
//           </thead>
//           <tbody>
//             {assignments.map((a) => (
//               <tr key={a._id}>
//                 <td className="border p-2">{a.assignedbusNumber}</td>
//                 <td className="border p-2">{a.conductorId?.name}</td>
//                 <td className="border p-2">{a.batch_no}</td>
//                 <td className="border p-2">{a.assignedDate}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </AdminLayout>
//   );
// };

// export default ConductorBusAssign;

import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi";

const ConductorBusAssign = () => {
  const [buses, setBuses] = useState([]);
  const [conductors, setConductors] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const [form, setForm] = useState({
    busId: "",
    conductorId: "",
  });

  const [editingId, setEditingId] = useState(null);

  const fetchData = async () => {
    const busRes = await axiosInstance.get("/api/buses");
    const conductorRes = await axiosInstance.get("/api/conductors");
    const assignRes = await axiosInstance.get("/api/conductor-bus");

    setBuses(busRes.data);
    setConductors(conductorRes.data);
    setAssignments(assignRes.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Assign or Update
  const handleAssign = async () => {
    try {
      if (!form.busId || !form.conductorId) {
        toast.error("Select bus and conductor");
        return;
      }

      const bus = buses.find((b) => b._id === form.busId);
      const conductor = conductors.find((c) => c._id === form.conductorId);

      if (editingId) {
        await axiosInstance.put(`/api/conductor-bus/${editingId}`, {
          busId: form.busId,
          assignedbusNumber: bus.busNumber,
          conductorId: form.conductorId,
          batch_no: conductor.batch_no,
        });
        toast.success("Assignment updated");
      } else {
        await axiosInstance.post("/api/conductor-bus", {
          busId: form.busId,
          assignedbusNumber: bus.busNumber,
          conductorId: form.conductorId,
          batch_no: conductor.batch_no,
          assignedDate: new Date().toISOString().split("T")[0],
        });
        toast.success("Assigned successfully");
      }

      setForm({ busId: "", conductorId: "" });
      setEditingId(null);
      fetchData();
    } catch (err) {
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Operation failed");
      }
    }
  };

  // Edit
  const handleEdit = (assignment) => {
    setEditingId(assignment._id);
    setForm({
      busId: assignment.busId,
      conductorId: assignment.conductorId?._id,
    });
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this assignment?")) return;
    try {
      await axiosInstance.delete(`/api/conductor-bus/${id}`);
      toast.success("Deleted successfully");
      fetchData();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Title */}
        <h1 className="text-3xl font-bold mb-2">Bus Conductor Assignment</h1>
        <p className="text-gray-500 mb-6">
          Assign buses to conductors. One bus → One conductor.
        </p>

        {/* Form Card */}
        <div className="bg-white shadow-md rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? "Edit Assignment" : "New Assignment"}
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {/* Bus Dropdown */}
            <select
              value={form.busId}
              className="border p-3 rounded"
              onChange={(e) => setForm({ ...form, busId: e.target.value })}
            >
              <option value="">Select Bus</option>
              {buses.map((bus) => (
                <option key={bus._id} value={bus._id}>
                  {bus.busNumber}
                </option>
              ))}
            </select>

            {/* Conductor Dropdown */}
            <select
              value={form.conductorId}
              className="border p-3 rounded"
              onChange={(e) =>
                setForm({ ...form, conductorId: e.target.value })
              }
            >
              <option value="">Select Conductor</option>
              {conductors.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.batch_no})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleAssign}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 mt-4 rounded flex items-center gap-2"
          >
            <FiPlus />
            {editingId ? "Update Assignment" : "Assign Bus"}
          </button>
        </div>

        {/* Assignment Table */}
        <div className="bg-white shadow-md rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Assigned Buses</h2>

          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-3">Bus Number</th>
                <th className="border p-3">Conductor</th>
                <th className="border p-3">Batch No</th>
                <th className="border p-3">Assigned Date</th>
                <th className="border p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a._id} className="text-center">
                  <td className="border p-2">{a.assignedbusNumber}</td>
                  <td className="border p-2">{a.conductorId?.name}</td>
                  <td className="border p-2">{a.batch_no}</td>
                  <td className="border p-2">{a.assignedDate}</td>
                  <td className="border p-2 flex justify-center gap-3">
                    <button
                      onClick={() => handleEdit(a)}
                      className="text-blue-600"
                    >
                      <FiEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(a._id)}
                      className="text-red-600"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ConductorBusAssign;