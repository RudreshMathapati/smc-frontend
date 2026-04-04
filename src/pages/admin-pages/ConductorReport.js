import React, { useState } from "react";
import AdminLayout from "./AdminLayout";
import axiosInstance from "../../utils/axiosInstance";
import { FiSearch } from "react-icons/fi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ConductorReport = () => {
  const [batchNo, setBatchNo] = useState("");
  const [date, setDate] = useState("");
  const [report, setReport] = useState(null);

const getReport = async () => {
  if (!batchNo) {
    toast.error("Please enter Conductor Batch No");
    return;
  }

  if (!date) {
    toast.error("Please select date");
    return;
  }

  try {
    const res = await axiosInstance.get(
      `/reports/conductor?batch_no=${batchNo}&date=${date}`,
    );
    setReport(res.data);
    toast.success("Report loaded successfully");
  } catch (err) {
    toast.error(err.response?.data?.message || "Report not found");
  }
};

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Page Title */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Conductor Daily Report
        </h1>
        <p className="text-gray-500 mb-6">
          View conductor collection, ticket summary and stop-wise passenger data
        </p>

        {/* Search Section */}
        <div className="bg-white shadow-md rounded-xl p-4 mb-6 flex gap-4 items-end">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Conductor Batch No
            </label>
            <input
              type="text"
              placeholder="Enter Batch No"
              value={batchNo}
              onChange={(e) => setBatchNo(e.target.value)}
              className="border p-2 rounded w-48"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Date
            </label>
            <input
              type="date"
              placeholder="30/8/2025"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border p-2 rounded w-40"
            />
          </div>

          <button
            onClick={getReport}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded flex items-center gap-2"
          >
            <FiSearch />
            Get Report
          </button>
        </div>

        {report && (
          <>
            {/* Conductor Info */}
            <div className="bg-white shadow-md rounded-xl p-5 mb-6">
              <h2 className="text-xl font-semibold mb-3 text-gray-700">
                Conductor Information
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-gray-700">
                <div>
                  <p className="text-sm text-gray-500">Batch No</p>
                  <p className="font-semibold">{report.conductor}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Bus Number</p>
                  <p className="font-semibold">{report.busNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Route</p>
                  <p className="font-semibold">{report.route}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-semibold">{report.date}</p>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-blue-100 p-4 rounded-xl shadow">
                <p className="text-gray-600">Total Tickets</p>
                <h2 className="text-2xl font-bold">
                  {report.summary.totalTickets}
                </h2>
              </div>

              <div className="bg-green-100 p-4 rounded-xl shadow">
                <p className="text-gray-600">Cash Collection</p>
                <h2 className="text-2xl font-bold">
                  ₹{report.summary.cash}
                </h2>
              </div>

              <div className="bg-purple-100 p-4 rounded-xl shadow">
                <p className="text-gray-600">Online Collection</p>
                <h2 className="text-2xl font-bold">
                  ₹{report.summary.online}
                </h2>
              </div>

              <div className="bg-yellow-100 p-4 rounded-xl shadow">
                <p className="text-gray-600">Total Collection</p>
                <h2 className="text-2xl font-bold">
                  ₹{report.summary.total}
                </h2>
              </div>
            </div>

            {/* Ticket Types */}
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div className="bg-white shadow rounded-xl p-4 text-center">
                <p className="text-gray-500">Full Tickets</p>
                <h2 className="text-2xl font-bold">
                  {report.ticketTypes.full}
                </h2>
              </div>

              <div className="bg-white shadow rounded-xl p-4 text-center">
                <p className="text-gray-500">Half Tickets</p>
                <h2 className="text-2xl font-bold">
                  {report.ticketTypes.half}
                </h2>
              </div>

              <div className="bg-white shadow rounded-xl p-4 text-center">
                <p className="text-gray-500">Pass</p>
                <h2 className="text-2xl font-bold">
                  {report.ticketTypes.pass}
                </h2>
              </div>
            </div>

            {/* Stop Table */}
            <div className="bg-white shadow-md rounded-xl p-5">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                Stop-wise Passenger Count
              </h2>
              <table className="w-full border rounded">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-3">Stop Name</th>
                    <th className="border p-3">Boarding</th>
                    <th className="border p-3">Dropping</th>
                  </tr>
                </thead>
                <tbody>
                  {report.stops.map((s, i) => (
                    <tr key={i} className="text-center">
                      <td className="border p-2">{s.stop}</td>
                      <td className="border p-2">{s.boarding}</td>
                      <td className="border p-2">{s.dropping}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default ConductorReport;