import React, { useEffect, useState, useCallback, useMemo } from "react";
import AdminLayout from "./AdminLayout";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import {
  FiClock,
  FiSun,
  FiMoon,
  FiUsers,
  FiUser,
  FiTrash2,
  FiCheckCircle,
  FiUserCheck,
  FiActivity,
  FiCheckSquare,
  FiSquare,
} from "react-icons/fi";

// ─────────────────────────────────────────────
// StatCard — exact same pattern as AdminDashboard
// ─────────────────────────────────────────────
const StatCard = ({ label, description, value, icon, color, bg }) => (
  <div
    className={`rounded-[24px] border border-[#E9ECEF] shadow-[0_10px_30px_rgba(0,0,0,0.04)] p-6 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:scale-[1.02] ${bg}`}
  >
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-500 tracking-wider">{label}</p>
        <span className={`text-3xl font-bold ${color} mt-2 block`}>{value}</span>
        {description && (
          <p className="text-xs text-gray-400 mt-2">{description}</p>
        )}
      </div>
      <div className="p-2 rounded-lg bg-white shadow-sm">{icon}</div>
    </div>
  </div>
);

// ─────────────────────────────────────────────
// CheckboxPersonList — multi-select scrollable list
// ─────────────────────────────────────────────
const CheckboxPersonList = ({
  title,
  icon,
  people,
  selectedIds,
  onToggle,
  onSelectAll,
  emptyMessage,
  accentColor,
  checkColor,
}) => {
  const allSelected =
    people.length > 0 && people.every((p) => selectedIds.has(p._id.toString()));
  const countSelected = people.filter((p) =>
    selectedIds.has(p._id.toString())
  ).length;

  return (
    <div className="flex flex-col flex-1 min-w-0">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg bg-white shadow-sm ${accentColor}`}>
            {icon}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">{title}</p>
            <p className="text-xs text-gray-400">
              {countSelected > 0
                ? `${countSelected} of ${people.length} selected`
                : `${people.length} available`}
            </p>
          </div>
        </div>

        {people.length > 0 && (
          <button
            type="button"
            onClick={() => onSelectAll(people, allSelected)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#0066CC] hover:text-[#0052A3] transition-colors"
          >
            {allSelected ? <FiCheckSquare size={13} /> : <FiSquare size={13} />}
            {allSelected ? "Deselect All" : "Select All"}
          </button>
        )}
      </div>

      {/* Scrollable checkbox list */}
      <div className="border border-[#E9ECEF] rounded-2xl overflow-y-auto max-h-60 bg-white divide-y divide-gray-50">
        {people.length === 0 ? (
          <div className="px-4 py-8 flex flex-col items-center gap-2 text-gray-400">
            <FiCheckCircle size={20} className="text-gray-300" />
            <span className="text-sm">{emptyMessage}</span>
          </div>
        ) : (
          people.map((person) => {
            const id = person._id.toString();
            const checked = selectedIds.has(id);
            return (
              <label
                key={id}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors select-none ${
                  checked ? "bg-blue-50" : "hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(id)}
                  className={`w-4 h-4 rounded cursor-pointer ${checkColor}`}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-medium truncate ${
                      checked ? "text-blue-700" : "text-gray-800"
                    }`}
                  >
                    {person.name}
                  </p>
                  <p className="text-xs text-gray-400 font-mono">
                    {person.batch_no}
                  </p>
                </div>
                {checked && (
                  <FiCheckCircle size={14} className="text-blue-500 flex-shrink-0" />
                )}
              </label>
            );
          })
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// ShiftTablePanel — existing assignments display
// ─────────────────────────────────────────────
const ShiftTablePanel = ({ shift, assignments, onRemove }) => {
  const isMorning = shift === "Morning";
  const accentColor = isMorning
    ? "text-teal-600 bg-gradient-to-br from-teal-50 to-teal-100"
    : "text-violet-600 bg-gradient-to-br from-violet-50 to-violet-100";
  const iconColor = isMorning ? "text-teal-500" : "text-violet-500";
  const badgeBg = isMorning ? "bg-teal-100 text-teal-700" : "bg-violet-100 text-violet-700";
  const SIcon = isMorning ? FiSun : FiMoon;

  const conductors = assignments.filter((a) => a.personType === "Conductor");
  const drivers = assignments.filter((a) => a.personType === "Driver");

  const PersonRows = ({ people, type }) => {
    if (people.length === 0)
      return (
        <tr>
          <td colSpan="3" className="px-5 py-4 text-center text-sm text-gray-400">
            No {type}s assigned to {shift} shift
          </td>
        </tr>
      );
    return people.map((a) => (
      <tr key={a._id} className="hover:bg-gray-50 transition-colors duration-150">
        <td className="px-5 py-3 text-sm font-medium text-gray-800">{a.name}</td>
        <td className="px-5 py-3 text-sm font-mono text-gray-500">{a.batch_no}</td>
        <td className="px-5 py-3 text-center">
          <button
            onClick={() => onRemove(a._id, a.name, shift)}
            className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
            title={`Remove ${a.name} from ${shift} shift`}
          >
            <FiTrash2 size={14} />
          </button>
        </td>
      </tr>
    ));
  };

  return (
    <div className="rounded-[24px] border border-[#E9ECEF] shadow-[0_10px_30px_rgba(0,0,0,0.04)] overflow-hidden bg-white">
      {/* Panel header — same gradient style as fleet cards */}
      <div className={`${accentColor} px-6 py-5 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white shadow-sm">
            <SIcon className={iconColor} size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-800">{shift} Shift</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {assignments.length} staff assigned
            </p>
          </div>
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badgeBg}`}>
          {conductors.length}C · {drivers.length}D
        </span>
      </div>

      {/* Conductors */}
      <div className="px-6 pt-5 pb-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1 rounded bg-blue-50">
            <FiUser className="text-blue-500" size={12} />
          </div>
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
            Conductors ({conductors.length})
          </span>
        </div>
        <div className="rounded-2xl border border-[#E9ECEF] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-5 py-2.5 text-left font-semibold">Name</th>
                <th className="px-5 py-2.5 text-left font-semibold">Batch No</th>
                <th className="px-5 py-2.5 text-center font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <PersonRows people={conductors} type="Conductor" />
            </tbody>
          </table>
        </div>
      </div>

      {/* Drivers */}
      <div className="px-6 pt-3 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1 rounded bg-emerald-50">
            <FiUsers className="text-emerald-500" size={12} />
          </div>
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
            Drivers ({drivers.length})
          </span>
        </div>
        <div className="rounded-2xl border border-[#E9ECEF] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-5 py-2.5 text-left font-semibold">Name</th>
                <th className="px-5 py-2.5 text-left font-semibold">Batch No</th>
                <th className="px-5 py-2.5 text-center font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <PersonRows people={drivers} type="Driver" />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
const ManageShifts = () => {
  const [allAssignments, setAllAssignments] = useState([]);
  const [allConductors, setAllConductors] = useState([]);
  const [allDrivers, setAllDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedShift, setSelectedShift] = useState("Morning");
  const [selectedConductorIds, setSelectedConductorIds] = useState(new Set());
  const [selectedDriverIds, setSelectedDriverIds] = useState(new Set());

  // ── Fetch ────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [assignRes, conductorRes, driverRes] = await Promise.all([
        axiosInstance.get("/api/shifts"),
        axiosInstance.get("/api/conductors"),
        axiosInstance.get("/api/drivers"),
      ]);
      setAllAssignments(assignRes.data);
      setAllConductors(conductorRes.data);
      setAllDrivers(driverRes.data);
    } catch (err) {
      toast.error("Failed to load shift data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Reset selections when tab changes
  useEffect(() => {
    setSelectedConductorIds(new Set());
    setSelectedDriverIds(new Set());
  }, [selectedShift]);

  // ── Compute available people ──────────────────────────────────────────
  const assignedConductorIds = useMemo(() => new Set(
    allAssignments
      .filter((a) => a.shift === selectedShift && a.personType === "Conductor")
      .map((a) => a.personId.toString())
  ), [allAssignments, selectedShift]);

  const assignedDriverIds = useMemo(() => new Set(
    allAssignments
      .filter((a) => a.shift === selectedShift && a.personType === "Driver")
      .map((a) => a.personId.toString())
  ), [allAssignments, selectedShift]);

  const availableConductors = useMemo(
    () => allConductors.filter((c) => !assignedConductorIds.has(c._id.toString())),
    [allConductors, assignedConductorIds]
  );
  const availableDrivers = useMemo(
    () => allDrivers.filter((d) => !assignedDriverIds.has(d._id.toString())),
    [allDrivers, assignedDriverIds]
  );

  // ── Checkbox toggles ──────────────────────────────────────────────────
  const toggle = (setter, id) =>
    setter((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleSelectAll = (people, isAll, setter) => {
    setter(isAll ? new Set() : new Set(people.map((p) => p._id.toString())));
  };

  const totalSelected = selectedConductorIds.size + selectedDriverIds.size;

  // ── Bulk assign ───────────────────────────────────────────────────────
  const handleBulkAssign = async () => {
    if (totalSelected === 0) {
      toast.warning("Select at least one conductor or driver first");
      return;
    }
    setSubmitting(true);
    try {
      const res = await axiosInstance.post("/api/shifts/bulk", {
        shift: selectedShift,
        conductorIds: [...selectedConductorIds],
        driverIds: [...selectedDriverIds],
      });
      toast.success(res.data.message);
      setSelectedConductorIds(new Set());
      setSelectedDriverIds(new Set());
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign shifts");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Remove from shift ─────────────────────────────────────────────────
  const handleRemove = async (id, name, shift) => {
    if (!window.confirm(`Remove "${name}" from ${shift} shift?`)) return;
    try {
      await axiosInstance.delete(`/api/shifts/${id}`);
      toast.success(`${name} removed from ${shift} shift`);
      fetchData();
    } catch (err) {
      toast.error("Failed to remove");
    }
  };

  const morningAssignments = allAssignments.filter((a) => a.shift === "Morning");
  const eveningAssignments = allAssignments.filter((a) => a.shift === "Evening");

  const statCards = [
    {
      label: "Morning Shift",
      value: morningAssignments.length,
      description: "Staff in morning duty",
      color: "text-teal-600",
      bg: "bg-gradient-to-br from-teal-50 to-teal-100",
      icon: <FiSun className="text-teal-500" size={22} />,
    },
    {
      label: "Evening Shift",
      value: eveningAssignments.length,
      description: "Staff in evening duty",
      color: "text-violet-600",
      bg: "bg-gradient-to-br from-violet-50 to-violet-100",
      icon: <FiMoon className="text-violet-500" size={22} />,
    },
    {
      label: "Total Conductors",
      value: allConductors.length,
      description: `${allAssignments.filter((a) => a.personType === "Conductor").length} assigned to shifts`,
      color: "text-blue-600",
      bg: "bg-gradient-to-br from-blue-50 to-blue-100",
      icon: <FiUserCheck className="text-blue-500" size={22} />,
    },
    {
      label: "Total Drivers",
      value: allDrivers.length,
      description: `${allAssignments.filter((a) => a.personType === "Driver").length} assigned to shifts`,
      color: "text-emerald-600",
      bg: "bg-gradient-to-br from-emerald-50 to-emerald-100",
      icon: <FiUsers className="text-emerald-500" size={22} />,
    },
  ];

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans">

        {/* ── Page Header ─────────────────────────────────────────── */}
        <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
              Shift Management
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Assign conductors and drivers to Morning or Evening shifts
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-white px-4 py-2 rounded-xl border border-[#E9ECEF] shadow-sm">
            <FiActivity className="text-[#0066CC]" size={14} />
            <span>Staff can work both shifts</span>
          </div>
        </div>

        {/* ── Stats Grid ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {statCards.map((card, i) => (
            <StatCard key={i} {...card} />
          ))}
        </div>

        {/* ── Assign Staff Panel ──────────────────────────────────── */}
        <div className="mb-8">
          {/* Section title */}
          <div className="flex items-center gap-2 mb-4">
            <FiClock className="text-[#0066CC] text-xl" />
            <h2 className="text-xl font-bold text-gray-800">Assign Staff to Shift</h2>
          </div>

          <div className="rounded-[24px] border border-[#E9ECEF] shadow-[0_10px_30px_rgba(0,0,0,0.04)] bg-white overflow-hidden">

            {/* Shift toggle tabs */}
            <div className="grid grid-cols-2 border-b border-[#E9ECEF]">
              {[
                {
                  value: "Morning",
                  label: "Morning Shift",
                  Icon: FiSun,
                  activeClass: "bg-teal-50 border-b-2 border-teal-500",
                  activeText: "text-teal-700",
                  activeIcon: "text-teal-500",
                },
                {
                  value: "Evening",
                  label: "Evening Shift",
                  Icon: FiMoon,
                  activeClass: "bg-violet-50 border-b-2 border-violet-500",
                  activeText: "text-violet-700",
                  activeIcon: "text-violet-500",
                },
              ].map((s) => {
                const active = selectedShift === s.value;
                return (
                  <button
                    key={s.value}
                    onClick={() => setSelectedShift(s.value)}
                    className={`flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all ${
                      active
                        ? `${s.activeClass} ${s.activeText}`
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <s.Icon size={16} className={active ? s.activeIcon : ""} />
                    {s.label}
                  </button>
                );
              })}
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center h-40 gap-3 text-gray-400 text-sm">
                  <div className="w-5 h-5 border-2 border-blue-300 border-t-[#0066CC] rounded-full animate-spin" />
                  Loading staff data...
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-500 mb-5">
                    Check conductors and/or drivers below, then click{" "}
                    <strong className="text-gray-700">Assign Selected</strong> to add them all to the{" "}
                    <strong className="text-gray-700">{selectedShift}</strong> shift at once.
                  </p>

                  {/* Two-column checkbox layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <CheckboxPersonList
                      title="Conductors"
                      icon={<FiUserCheck size={14} />}
                      accentColor="text-blue-500"
                      checkColor="accent-blue-600"
                      people={availableConductors}
                      selectedIds={selectedConductorIds}
                      onToggle={(id) => toggle(setSelectedConductorIds, id)}
                      onSelectAll={(p, a) => handleSelectAll(p, a, setSelectedConductorIds)}
                      emptyMessage={`All conductors are already in the ${selectedShift} shift`}
                    />
                    <CheckboxPersonList
                      title="Drivers"
                      icon={<FiUsers size={14} />}
                      accentColor="text-emerald-500"
                      checkColor="accent-emerald-600"
                      people={availableDrivers}
                      selectedIds={selectedDriverIds}
                      onToggle={(id) => toggle(setSelectedDriverIds, id)}
                      onSelectAll={(p, a) => handleSelectAll(p, a, setSelectedDriverIds)}
                      emptyMessage={`All drivers are already in the ${selectedShift} shift`}
                    />
                  </div>

                  {/* Footer: summary + action button */}
                  <div className="flex items-center justify-between pt-5 border-t border-[#E9ECEF]">
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      {totalSelected === 0 ? (
                        <span className="text-gray-400">No staff selected</span>
                      ) : (
                        <>
                          <span className="font-semibold text-gray-700">
                            {totalSelected} selected
                          </span>
                          {selectedConductorIds.size > 0 && (
                            <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                              {selectedConductorIds.size}{" "}
                              {selectedConductorIds.size === 1 ? "Conductor" : "Conductors"}
                            </span>
                          )}
                          {selectedDriverIds.size > 0 && (
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                              {selectedDriverIds.size}{" "}
                              {selectedDriverIds.size === 1 ? "Driver" : "Drivers"}
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    <button
                      onClick={handleBulkAssign}
                      disabled={submitting || totalSelected === 0}
                      className="flex items-center gap-2 px-6 py-2.5 bg-[#0066CC] text-white rounded-xl shadow-lg shadow-blue-200 hover:bg-[#0052A3] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none active:scale-95 text-sm font-semibold"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Assigning...
                        </>
                      ) : (
                        <>
                          <FiCheckCircle size={15} />
                          Assign{totalSelected > 0 ? ` ${totalSelected}` : ""} to{" "}
                          {selectedShift} Shift
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Current Assignments ─────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FiUserCheck className="text-[#0066CC] text-xl" />
            <h2 className="text-xl font-bold text-gray-800">Current Shift Assignments</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40 gap-3 text-gray-400 text-sm">
              <div className="w-5 h-5 border-2 border-blue-300 border-t-[#0066CC] rounded-full animate-spin" />
              Loading assignments...
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ShiftTablePanel
                shift="Morning"
                assignments={morningAssignments}
                onRemove={handleRemove}
              />
              <ShiftTablePanel
                shift="Evening"
                assignments={eveningAssignments}
                onRemove={handleRemove}
              />
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ManageShifts;
