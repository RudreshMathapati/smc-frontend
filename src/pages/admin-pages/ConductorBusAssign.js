import React, { useEffect, useState, useCallback } from "react";
import AdminLayout from "./AdminLayout";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import { FiEdit, FiTrash2, FiPlus, FiSun, FiMoon } from "react-icons/fi";

const SHIFTS = [
  { value: "Morning", label: "🌅 Morning", icon: <FiSun /> },
  { value: "Evening", label: "🌙 Evening", icon: <FiMoon /> },
];

const ConductorBusAssign = () => {
  const [buses, setBuses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);

  // Shift-filtered available conductors + drivers
  const [availableConductors, setAvailableConductors] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);

  const [form, setForm] = useState({
    shift: "",
    busId: "",
    conductorId: "",
    driverId: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Fetch buses + all existing assignments ────────────────────────────
  const fetchBaseData = useCallback(async () => {
    try {
      setLoadingAssignments(true);
      const [busRes, assignRes] = await Promise.all([
        axiosInstance.get("/api/buses"),
        axiosInstance.get("/api/conductor-bus"),
      ]);
      setBuses(busRes.data);
      setAssignments(assignRes.data);
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoadingAssignments(false);
    }
  }, []);

  useEffect(() => {
    fetchBaseData();
  }, [fetchBaseData]);

  // ── When shift changes: load available staff for that shift ───────────
  useEffect(() => {
    if (!form.shift) {
      setAvailableConductors([]);
      setAvailableDrivers([]);
      return;
    }

    const fetchAvailable = async () => {
      try {
        setLoadingAvailable(true);
        // Reset person selections when shift changes only if we are NOT editing this shift
        const isEditingThisShift = editingAssignment && editingAssignment.shift === form.shift;
        if (!isEditingThisShift) {
          setForm((prev) => ({ ...prev, conductorId: "", driverId: "" }));
        }

        const res = await axiosInstance.get(
          `/api/shifts/available?shift=${form.shift}`
        );
        let conductors = res.data.conductors || [];
        let drivers = res.data.drivers || [];

        // If editing and shift matches, ensure currently assigned conductor/driver are included in the available options
        if (isEditingThisShift && editingAssignment) {
          const currentConductor = editingAssignment.conductorId;
          const currentDriver = editingAssignment.driverId;

          if (currentConductor && !conductors.some(c => c._id === currentConductor._id)) {
            conductors = [
              {
                _id: currentConductor._id,
                name: currentConductor.name,
                batch_no: editingAssignment.batch_no || currentConductor.batch_no
              },
              ...conductors
            ];
          }
          if (currentDriver && !drivers.some(d => d._id === currentDriver._id)) {
            drivers = [
              {
                _id: currentDriver._id,
                name: currentDriver.name,
                batch_no: editingAssignment.driver_batch_no || currentDriver.batch_no
              },
              ...drivers
            ];
          }
        }

        setAvailableConductors(conductors);
        setAvailableDrivers(drivers);
      } catch (err) {
        toast.error("Failed to load available staff for this shift");
        setAvailableConductors([]);
        setAvailableDrivers([]);
      } finally {
        setLoadingAvailable(false);
      }
    };

    fetchAvailable();
  }, [form.shift, editingAssignment]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handle form field change ──────────────────────────────────────────
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ── Assign or Update ──────────────────────────────────────────────────
  const handleAssign = async () => {
    if (!form.shift) {
      toast.warning("Please select a shift first");
      return;
    }
    if (!form.busId || !form.conductorId || !form.driverId) {
      toast.error("Select bus, conductor and driver");
      return;
    }

    const bus = buses.find((b) => b._id === form.busId);
    const conductor = availableConductors.find(
      (c) => c._id.toString() === form.conductorId
    );
    const driver = availableDrivers.find(
      (d) => d._id.toString() === form.driverId
    );

    if (!bus || !conductor || !driver) {
      toast.error("Invalid selection — please re-select");
      return;
    }

    const actionText = editingId ? "update" : "save";
    if (!window.confirm(`Are you sure you want to ${actionText} this assignment?`)) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        busId: form.busId,
        assignedbusNumber: bus.busNumber,
        conductorId: form.conductorId,
        batch_no: conductor.batch_no,
        driverId: form.driverId,
        driver_batch_no: driver.batch_no,
        shift: form.shift,
      };

      if (editingId) {
        await axiosInstance.put(`/api/conductor-bus/${editingId}`, payload);
        toast.success("Assignment updated successfully");
        alert("Assignment updated successfully");
      } else {
        await axiosInstance.post("/api/conductor-bus", {
          ...payload,
          assignedDate: new Date().toISOString().split("T")[0],
        });
        toast.success("Bus assigned successfully");
      }

      resetForm();
      fetchBaseData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Edit: load existing assignment into form ──────────────────────────
  const handleEdit = async (assignment) => {
    const assignedShift = assignment.shift || "Morning";
    setEditingId(assignment._id);
    setEditingAssignment(assignment);

    // Set shift first so the useEffect fetches available staff
    setForm({
      shift: assignedShift,
      busId: assignment.busId?._id || assignment.busId || "",
      conductorId: assignment.conductorId?._id || "",
      driverId: assignment.driverId?._id || "",
    });

    toast.info(`Editing assignment — shift: ${assignedShift}`);
  };

  // ── Delete ────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Remove this bus assignment?")) return;
    try {
      await axiosInstance.delete(`/api/conductor-bus/${id}`);
      toast.success("Assignment removed");
      fetchBaseData();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  // ── Reset form ────────────────────────────────────────────────────────
  const resetForm = () => {
    setForm({ shift: "", busId: "", conductorId: "", driverId: "" });
    setEditingId(null);
    setEditingAssignment(null);
    setAvailableConductors([]);
    setAvailableDrivers([]);
  };

  // ── Shift badge style helper ──────────────────────────────────────────
  const shiftBadge = (shift) => {
    if (!shift) return null;
    const isMorning = shift === "Morning";
    return (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
          isMorning
            ? "bg-amber-100 text-amber-700"
            : "bg-indigo-100 text-indigo-700"
        }`}
      >
        {isMorning ? "🌅" : "🌙"} {shift}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Bus Conductor & Driver Assignment
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Select a shift first to see available conductors and drivers, then
            assign a bus.
          </p>
        </div>

        {/* ── Assignment Form ────────────────────────────── */}
        <div className="bg-white shadow-md rounded-2xl p-6 mb-8 border border-gray-100">
          <h2 className="text-base font-semibold text-gray-700 mb-5 flex items-center gap-2">
            <FiPlus className="text-blue-500" />
            {editingId ? "Edit Assignment" : "New Assignment"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

            {/* STEP 1 — Shift selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Step 1 — Shift *
              </label>
              <div className="flex gap-2">
                {SHIFTS.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => handleChange("shift", s.value)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border-2 text-sm font-semibold transition-all ${
                      form.shift === s.value
                        ? s.value === "Morning"
                          ? "border-amber-400 bg-amber-50 text-amber-700"
                          : "border-indigo-400 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {s.icon} {s.value}
                  </button>
                ))}
              </div>
              {!form.shift && (
                <p className="text-xs text-red-400 mt-1">
                  Select a shift to load available staff
                </p>
              )}
            </div>

            {/* STEP 2 — Bus */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Step 2 — Bus *
              </label>
              <select
                value={form.busId}
                onChange={(e) => handleChange("busId", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={!form.shift || !!editingId}
              >
                <option value="">Select Bus</option>
                {buses.map((bus) => (
                  <option key={bus._id} value={bus._id}>
                    {bus.busNumber}
                  </option>
                ))}
              </select>
            </div>

            {/* STEP 3 — Conductor (filtered by shift) */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Step 3 — Conductor *
              </label>
              <select
                value={form.conductorId}
                onChange={(e) => handleChange("conductorId", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition disabled:bg-gray-50"
                disabled={!form.shift || loadingAvailable}
              >
                <option value="">
                  {!form.shift
                    ? "Select shift first"
                    : loadingAvailable
                    ? "Loading..."
                    : availableConductors.length === 0
                    ? "No conductors available"
                    : "Select Conductor"}
                </option>
                {availableConductors.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.batch_no})
                  </option>
                ))}
              </select>
              {form.shift && !loadingAvailable && availableConductors.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  No conductors available for {form.shift} shift
                </p>
              )}
            </div>

            {/* STEP 4 — Driver (filtered by shift) */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Step 4 — Driver *
              </label>
              <select
                value={form.driverId}
                onChange={(e) => handleChange("driverId", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition disabled:bg-gray-50"
                disabled={!form.shift || loadingAvailable}
              >
                <option value="">
                  {!form.shift
                    ? "Select shift first"
                    : loadingAvailable
                    ? "Loading..."
                    : availableDrivers.length === 0
                    ? "No drivers available"
                    : "Select Driver"}
                </option>
                {availableDrivers.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.batch_no})
                  </option>
                ))}
              </select>
              {form.shift && !loadingAvailable && availableDrivers.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  No drivers available for {form.shift} shift
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleAssign}
              disabled={isSubmitting || !form.shift || loadingAvailable}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
            >
              <FiPlus />
              {isSubmitting
                ? "Saving..."
                : editingId
                ? "Update Assignment"
                : "Assign Bus"}
            </button>
            {editingId && (
              <button
                onClick={resetForm}
                className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </div>

        {/* ── Assignments Table ───────────────────────────── */}
        <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-100">
          <h2 className="text-base font-semibold text-gray-700 mb-5">
            Active Assignments
          </h2>

          {loadingAssignments ? (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
              <div className="w-6 h-6 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin mr-3" />
              Loading assignments...
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="px-4 py-3">Shift</th>
                    <th className="px-4 py-3">Bus Number</th>
                    <th className="px-4 py-3">Conductor</th>
                    <th className="px-4 py-3">Batch No</th>
                    <th className="px-4 py-3">Driver</th>
                    <th className="px-4 py-3">Driver Batch</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {assignments.length === 0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="px-4 py-10 text-center text-gray-400 text-sm"
                      >
                        No active assignments found.
                      </td>
                    </tr>
                  ) : (
                    assignments.map((a) => (
                      <tr
                        key={a._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          {shiftBadge(a.shift)}
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-800">
                          {a.assignedbusNumber}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {a.conductorId?.name || "N/A"}
                        </td>
                        <td className="px-4 py-3 font-mono text-gray-500">
                          {a.batch_no}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {a.driverId?.name || "N/A"}
                        </td>
                        <td className="px-4 py-3 font-mono text-gray-500">
                          {a.driver_batch_no || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {a.assignedDate}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => handleEdit(a)}
                              className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <FiEdit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(a._id)}
                              className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                              title="Remove"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
};

export default ConductorBusAssign;