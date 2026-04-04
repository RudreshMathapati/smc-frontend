import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import { FiTrash2, FiPlus } from "react-icons/fi";

const ManageFareCharts = () => {
  const [fares, setFares] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch fare chart
  const fetchFareChart = async () => {
    try {
      const res = await axiosInstance.get("/api/farechart");
      setFares(res.data.fares || {});
    } catch (err) {
      toast.error("Failed to load fare chart");
    }
  };

  useEffect(() => {
    fetchFareChart();
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

      await axiosInstance.put("/api/farechart", { fares: cleanedFares });

      toast.success("Fare chart updated successfully");
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
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Fare Chart Management
        </h1>
        <p className="text-gray-500 mb-6">
          Edit stage-wise ticket pricing. Fare is calculated based on stage difference.
        </p>

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
        </div>

        {/* Save Button */}
        <div className="flex justify-end mt-6">
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg shadow-md"
          >
            {loading ? "Saving..." : "Save Fare Chart"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ManageFareCharts;