import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

const FareCalculator = () => {
  const [stops, setStops] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [fare, setFare] = useState(null);
  const [loading, setLoading] = useState(false);

  // ⚠️ Put your routeId
  const routeId = "68d79370e445440ae3fbcd4f";

  // ✅ Fetch stops from backend
  const fetchStops = async () => {
    try {
      const res = await axiosInstance.get(`/routes/${routeId}`);
      
      // Take first trip stops (you can improve later)
      const routeStops = res.data.trips[0].stops;

      // Sort by sequence
      const sortedStops = routeStops.sort((a, b) => a.sequence - b.sequence);

      setStops(sortedStops);
    } catch (err) {
      console.error(err);
      alert("Failed to load stops");
    }
  };

  useEffect(() => {
    fetchStops();
  }, []);

  // ✅ Calculate Fare
  const handleCalculate = async () => {
    if (!from || !to) {
      alert("Please select both stops");
      return;
    }

    try {
      setLoading(true);

      const res = await axiosInstance.post("/calculate-fare", {
        routeId,
        from,
        to,
      });

      setFare(res.data.fare);
    } catch (err) {
      alert(err.response?.data?.message || "Error calculating fare");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "400px", margin: "auto" }}>
      <h2>🎫 Ticket Fare Calculator</h2>

      {/* FROM DROPDOWN */}
      <div style={{ marginBottom: "10px" }}>
        <label>From</label>
        <select
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          style={{ width: "100%", padding: "10px" }}
        >
          <option value="">Select Source</option>

          {/* ✅ Source stage = 0 */}

          {stops.map((stop, index) => (
            <option key={index} value={stop.name}>
              {stop.name} (Stage {stop.stage})
            </option>
          ))}
        </select>
      </div>

      {/* TO DROPDOWN */}
      <div style={{ marginBottom: "10px" }}>
        <label>To</label>
        <select
          value={to}
          onChange={(e) => setTo(e.target.value)}
          style={{ width: "100%", padding: "10px" }}
        >
          <option value="">Select Destination</option>

          {stops.map((stop, index) => (
            <option key={index} value={stop.name}>
              {stop.name} (Stage {stop.stage})
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleCalculate}
        style={{
          width: "100%",
          padding: "10px",
          background: "blue",
          color: "white",
          border: "none",
        }}
      >
        {loading ? "Calculating..." : "Calculate Fare"}
      </button>

      {fare !== null && (
        <h3 style={{ marginTop: "20px" }}>
          💰 Fare: ₹{fare}
        </h3>
      )}
    </div>
  );
};

export default FareCalculator;