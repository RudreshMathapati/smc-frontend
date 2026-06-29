import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import { FiTrash2, FiPlus, FiEye } from "react-icons/fi";

const ManageFareCharts = () => {
  const [fares, setFares] = useState({});
  const [originalFares, setOriginalFares] = useState({});
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch active fare chart
  const fetchFareChart = async () => {
    try {
      const res = await axiosInstance.get("/api/farechart");
      const faresData = res.data.fares || {};
      setFares(faresData);
      setOriginalFares(faresData);
    } catch (err) {
      toast.error("Failed to load fare chart");
    }
  };

  // Fetch history
  const fetchHistory = async () => {
    try {
      const res = await axiosInstance.get("/api/farechart/history");
      setHistory(res.data || []);
    } catch (err) {
      console.error("Failed to load history list:", err);
    }
  };

  useEffect(() => {
    fetchFareChart();
    fetchHistory();
  }, []);

  // Change price
  const handleChange = (stage, value) => {
    setFares({
      ...fares,
      [stage]: value === "" ? "" : Number(value),
    });
  };

  // Delete ONLY last stage
  const deleteStage = (stage) => {
    const stages = Object.keys(fares).map(Number);
    const maxStage = Math.max(...stages);

    if (Number(stage) !== maxStage) {
      toast.error("You can only delete the last stage");
      return;
    }

    const updated = { ...fares };
    delete updated[stage];
    setFares(updated);
  };

  // Add stage
  const addStage = () => {
    const stages = Object.keys(fares).map(Number);

    let nextStage;

    if (stages.length === 0) {
      nextStage = 1;
    } else {
      const maxStage = Math.max(...stages);

      if (fares[maxStage] === "" || fares[maxStage] === 0) {
        toast.error(`Please enter price for Stage ${maxStage} first`);
        return;
      }

      nextStage = maxStage + 1;
    }

    setFares({
      ...fares,
      [nextStage]: "",
    });
  };

  // Save
  const handleSave = async () => {
    try {
      setLoading(true);

      const cleanedFares = {};
      Object.keys(fares).forEach((stage) => {
        if (fares[stage] !== "" && fares[stage] !== null) {
          cleanedFares[stage] = Number(fares[stage]);
        }
      });

      const stages = Object.keys(cleanedFares)
        .map(Number)
        .sort((a, b) => a - b);

      if (stages.length === 0) {
        toast.error("Please add at least one stage");
        setLoading(false);
        return;
      }

      // Ensure continuous stages
      let expected = 1;
      for (let stage of stages) {
        if (stage !== expected) {
          toast.error(`Stage ${expected} price is missing`);
          setLoading(false);
          return;
        }
        expected++;
      }

      // Check if fares has changed compared to originalFares
      const originalKeys = Object.keys(originalFares);
      const cleanedKeys = Object.keys(cleanedFares);
      
      let isChanged = false;
      if (originalKeys.length !== cleanedKeys.length) {
        isChanged = true;
      } else {
        for (let key of originalKeys) {
          if (Number(originalFares[key]) !== Number(cleanedFares[key])) {
            isChanged = true;
            break;
          }
        }
      }

      if (!isChanged) {
        toast.info("No changes to save");
        setLoading(false);
        return;
      }

      await axiosInstance.put("/api/farechart", { fares: cleanedFares });

      toast.success("Fare chart updated successfully");
      fetchFareChart();
      fetchHistory();
    } catch (err) {
      toast.error("Error updating fare chart");
    } finally {
      setLoading(false);
    }
  };

  const stagesSorted = Object.keys(fares)
    .map(Number)
    .sort((a, b) => a - b);

  const maxStage = stagesSorted.length > 0 ? Math.max(...stagesSorted) : null;

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Fare Chart Management
          </h1>
          <p className="text-gray-500">
            Edit stage-wise ticket pricing. Fare is calculated based on stage difference.
          </p>
        </div>

        {/* Current Fare Chart Card */}
        <div className="bg-white shadow-md rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-6 text-gray-700">
            Stage Fare Table
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {stagesSorted.map((stage) => (
              <div key={stage} className="relative">
                {/* Show delete icon ONLY for last stage */}
                {stage === maxStage && (
                  <button
                    onClick={() => deleteStage(stage)}
                    className="absolute -top-2 -right-2 text-red-500 hover:text-red-700"
                  >
                    <FiTrash2 size={16} />
                  </button>
                )}

                <label className="block text-sm text-gray-600 mb-1">
                  Stage {stage}
                </label>

                <input
                  type="number"
                  placeholder="Enter price"
                  value={fares[stage]}
                  onChange={(e) => handleChange(stage, e.target.value)}
                  className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}

            {/* Add Stage Card */}
            <div
              onClick={addStage}
              className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 h-[70px]"
            >
              <FiPlus className="text-gray-500" size={20} />
              <span className="text-sm text-gray-500">Add Stage</span>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end mt-6">
            <button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg shadow-md font-semibold transition-colors"
            >
              {loading ? "Saving..." : "Save Fare Chart"}
            </button>
          </div>
        </div>

        {/* History Section */}
        <div className="bg-white shadow-md rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Fare Chart History
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Archived
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Stages
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.length > 0 ? (
                  history.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {new Date(item.archivedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {Object.keys(item.fares || {}).length} Stages
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedHistory(item);
                            setShowModal(true);
                          }}
                          className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <FiEye size={14} />
                          <span>View Fares</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="3"
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No historical fare charts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* View Fares Modal */}
        {showModal && selectedHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
            <div className="bg-white rounded-xl shadow-xl border border-gray-200 max-w-4xl w-full mx-4 overflow-hidden transform transition-all">
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800 text-lg">
                  Archived Fare Chart - {new Date(selectedHistory.archivedAt).toLocaleString()}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedHistory(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  &times;
                </button>
              </div>
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {Object.keys(selectedHistory.fares || {})
                    .map(Number)
                    .sort((a, b) => a - b)
                    .map((stage) => (
                      <div key={stage} className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center shadow-sm">
                        <div className="text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wider">
                          Stage {stage}
                        </div>
                        <div className="text-lg font-bold text-blue-600">
                          ₹{selectedHistory.fares[stage]}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedHistory(null);
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ManageFareCharts;