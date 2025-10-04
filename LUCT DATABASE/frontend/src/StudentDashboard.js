// src/components/StudentDashboard.js
import React, { useState, useEffect } from "react";
import axios from "axios";

function StudentDashboard({ token }) {
  const [monitoringData, setMonitoringData] = useState([]);
  const [ratings, setRatings] = useState({});
  const [reports, setReports] = useState([]);

  // Fetch monitoring data
  const fetchMonitoring = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/monitoring", {
        headers: { Authorization: token },
      });
      setMonitoringData(res.data || []);
    } catch {
      alert("Failed to load monitoring data");
    }
  };

  // Fetch reports for rating
  const fetchReports = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/reports/view", {
        headers: { Authorization: token },
      });
      setReports(res.data || []);
    } catch {
      alert("Failed to load reports");
    }
  };

  // Submit rating
  const handleRate = async (id) => {
    const rate = parseInt(ratings[id]);
    if (!rate || rate < 1 || rate > 5) {
      alert("Enter a rating between 1 and 5");
      return;
    }
    try {
      await axios.post(
        "http://localhost:5000/api/rate",
        { report_id: id, rating: rate },
        { headers: { Authorization: token } }
      );
      alert("Rated successfully");
      fetchReports();
    } catch {
      alert("Failed to rate");
    }
  };

  useEffect(() => {
    fetchMonitoring();
    fetchReports();
  }, []);

  return (
    <div className="container mt-4">
      <h2>Dashboard - STUDENT</h2>

      {/* Monitoring Section */}
      <div className="mb-4">
        <h4>Monitoring</h4>
        {monitoringData.length === 0 ? (
          <p>No monitoring data available.</p>
        ) : (
          <ul className="list-group">
            {monitoringData.map((item, index) => (
              <li key={index} className="list-group-item">
                {item.description}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Reports & Ratings Section */}
      <div>
        <h4>Rate Reports</h4>
        {reports.length === 0 ? (
          <p>No reports available.</p>
        ) : (
          <table className="table table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>Course</th>
                <th>Week</th>
                <th>Lecturer</th>
                <th>Rate</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
                  <td>{report.id}</td>
                  <td>{report.course_name}</td>
                  <td>{report.week_of_reporting}</td>
                  <td>{report.lecturer_name}</td>
                  <td>
                    <div className="d-flex">
                      <input
                        type="number"
                        min="1"
                        max="5"
                        className="form-control me-2"
                        placeholder="1-5"
                        onChange={(e) =>
                          setRatings({ ...ratings, [report.id]: e.target.value })
                        }
                      />
                      <button
                        className="btn btn-primary"
                        onClick={() => handleRate(report.id)}
                      >
                        Rate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;
