// src/components/LecturerDashboard.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import './App.css';

function LecturerDashboard({ token }) {
  const [reports, setReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newReport, setNewReport] = useState({
    course_name: "",
    week_of_reporting: "",
    actual_students: "",
    total_registered_students: "",
  });
  const [ratings, setRatings] = useState({});
  const [showDataEntry, setShowDataEntry] = useState(false); // toggle for data entry form

  const fetchReports = async (query = "") => {
    try {
      const url = query
        ? `/api/reports/search?query=${encodeURIComponent(query)}`
        : "/api/reports/view";
      const res = await axios.get(`http://localhost:5000${url}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(res.data);
    } catch (err) {
      console.error("Fetch reports error:", err);
      alert("Failed to load reports");
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleAddReport = async () => {
    try {
      await axios.post("http://localhost:5000/api/reports", newReport, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Report added");
      setNewReport({
        course_name: "",
        week_of_reporting: "",
        actual_students: "",
        total_registered_students: "",
      });
      fetchReports();
      setShowDataEntry(false);
    } catch (err) {
      console.error("Add report error:", err.response ? err.response.data : err.message);
      alert("Failed to add report");
    }
  };

  const handleRate = async (id) => {
    const ratingValue = parseInt(ratings[id]);
    if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
      alert("Enter a rating between 1 and 5");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/rate",
        { report_id: id, rating: ratingValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Rate API response:", res.data);
      alert("Rated successfully");
      fetchReports();
    } catch (err) {
      console.error("Rate API error:", err.response ? err.response.data : err.message);
      alert(err.response?.data?.message || "Failed to rate");
    }
  };

  const downloadExcel = async (id) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/reports/download/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `report_${id}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Download error:", err);
      alert("Download failed");
    }
  };

  // Chart data
  const attendanceData = {
    labels: reports.map((r) => r.course_name || "Unknown"),
    datasets: [
      {
        label: "Actual Students",
        data: reports.map((r) => r.actual_students || 0),
        backgroundColor: "rgba(75,192,192,0.6)",
      },
      {
        label: "Registered Students",
        data: reports.map((r) => r.total_registered_students || 0),
        backgroundColor: "rgba(153,102,255,0.6)",
      },
    ],
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ marginBottom: "20px", color: "#333" }}>Dashboard - LECTURER</h2>

      {/* Button to toggle data entry */}
      <button
        style={{
          backgroundColor: "#28a745",
          color: "white",
          padding: "8px 16px",
          border: "none",
          borderRadius: "4px",
          marginBottom: "15px",
          cursor: "pointer",
        }}
        onClick={() => setShowDataEntry(!showDataEntry)}
      >
        {showDataEntry ? "Hide Data Entry Form" : "Add New Report"}
      </button>

      {/* Add New Report */}
      {showDataEntry && (
        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "15px",
            marginBottom: "20px",
            backgroundColor: "#514b4bff",
          }}
        >
          <h5 style={{ marginBottom: "10px" }}>Data Entry - Lecturer Reporting Form</h5>
          <input
            type="text"
            placeholder="Course Name"
            value={newReport.course_name || ""}
            onChange={(e) =>
              setNewReport({ ...newReport, course_name: e.target.value })
            }
            style={{ marginBottom: "8px", padding: "8px", width: "100%" }}
          />
          <input
            type="text"
            placeholder="Week of Reporting"
            value={newReport.week_of_reporting || ""}
            onChange={(e) =>
              setNewReport({ ...newReport, week_of_reporting: e.target.value })
            }
            style={{ marginBottom: "8px", padding: "8px", width: "100%" }}
          />
          <input
            type="number"
            placeholder="Actual Students Present"
            value={newReport.actual_students || ""}
            onChange={(e) =>
              setNewReport({ ...newReport, actual_students: e.target.value })
            }
            style={{ marginBottom: "8px", padding: "8px", width: "100%" }}
          />
          <input
            type="number"
            placeholder="Total Registered Students"
            value={newReport.total_registered_students || ""}
            onChange={(e) =>
              setNewReport({ ...newReport, total_registered_students: e.target.value })
            }
            style={{ marginBottom: "8px", padding: "8px", width: "100%" }}
          />
          <button
            onClick={handleAddReport}
            style={{
              backgroundColor: "#007bff",
              color: "white",
              padding: "8px 16px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Submit Report
          </button>
        </div>
      )}

      {/* Search */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search by course or week..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: "8px", width: "250px", marginRight: "10px" }}
        />
        <button
          onClick={() => fetchReports(searchQuery)}
          style={{
            padding: "8px 12px",
            marginRight: "5px",
            backgroundColor: "#17a2b8",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Search
        </button>
        <button
          onClick={() => {
            setSearchQuery("");
            fetchReports();
          }}
          style={{
            padding: "8px 12px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Clear
        </button>
      </div>

      {/* Charts */}
      {reports.length > 0 && (
        <div style={{ height: "400px", margin: "20px 0" }}>
          <Bar data={attendanceData} options={{ responsive: true }} />
        </div>
      )}

      {/* Reports Table */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#007bff", color: "white" }}>
            <th style={{ padding: "8px" }}>ID</th>
            <th style={{ padding: "8px" }}>Course</th>
            <th style={{ padding: "8px" }}>Week</th>
            <th style={{ padding: "8px" }}>Lecturer</th>
            <th style={{ padding: "8px" }}>Rating</th>
            <th style={{ padding: "8px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", padding: "10px" }}>
                No reports found
              </td>
            </tr>
          ) : (
            reports.map((report) => (
              <tr key={report.id} style={{ borderBottom: "1px solid #ccc" }}>
                <td style={{ padding: "8px" }}>{report.id}</td>
                <td style={{ padding: "8px" }}>{report.course_name}</td>
                <td style={{ padding: "8px" }}>{report.week_of_reporting}</td>
                <td style={{ padding: "8px" }}>{report.lecturer_name}</td>
                <td style={{ padding: "8px" }}>{report.rating ? `${report.rating}/5` : "Not rated"}</td>
                <td style={{ padding: "8px" }}>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    placeholder="Rate 1-5"
                    onChange={(e) =>
                      setRatings({ ...ratings, [report.id]: e.target.value })
                    }
                    style={{ width: "60px", marginRight: "5px" }}
                  />
                  <button
                    onClick={() => handleRate(report.id)}
                    style={{
                      backgroundColor: "#ffc107",
                      color: "black",
                      padding: "4px 8px",
                      border: "none",
                      borderRadius: "4px",
                      marginRight: "5px",
                      cursor: "pointer",
                    }}
                  >
                    Rate
                  </button>
                  <button
                    onClick={() => downloadExcel(report.id)}
                    style={{
                      backgroundColor: "#007bff",
                      color: "white",
                      padding: "4px 8px",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Excel
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default LecturerDashboard;
