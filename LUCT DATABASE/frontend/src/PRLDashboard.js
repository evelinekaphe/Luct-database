// src/components/PRLDashboard.js
import React, { useState, useEffect } from "react";
import axios from "axios";

function PRLDashboard({ token }) {
  const [courses, setCourses] = useState([]);
  const [reports, setReports] = useState([]);
  const [classes, setClasses] = useState([]);
  const [feedback, setFeedback] = useState({});

  // Fetch courses (view only)
  const fetchCourses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/courses", {
        headers: { Authorization: token },
      });
      setCourses(res.data);
    } catch {
      alert("Failed to load courses");
    }
  };

  // Fetch reports (with feedback option)
  const fetchReports = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/reports/view", {
        headers: { Authorization: token },
      });
      setReports(res.data);
    } catch {
      alert("Failed to load reports");
    }
  };

  // Fetch classes (view only)
  const fetchClasses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/classes", {
        headers: { Authorization: token },
      });
      setClasses(res.data);
    } catch {
      alert("Failed to load classes");
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchReports();
    fetchClasses();
  }, []);

  // Handle feedback on reports
  const handleFeedback = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/reports/feedback/${id}`,
        { feedback: feedback[id] },
        { headers: { Authorization: token } }
      );
      alert("Feedback added");
      fetchReports();
    } catch {
      alert("Failed to add feedback");
    }
  };

  return (
    <div>
      <h2>Dashboard - PRL</h2>

      {/* Courses (view only) */}
      <h4>Courses (View Only)</h4>
      <ul className="list-group mb-3">
        {courses.map((c) => (
          <li key={c.id} className="list-group-item">
            {c.name}
          </li>
        ))}
      </ul>

      {/* Reports with ability to give feedback */}
      <h4>Reports</h4>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Course</th>
            <th>Week</th>
            <th>Lecturer</th>
            <th>Feedback</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.id}>
              <td>{report.id}</td>
              <td>{report.course_name}</td>
              <td>{report.week_of_reporting}</td>
              <td>{report.lecturer_name}</td>
              <td>{report.feedback || "None"}</td>
              <td>
                <input
                  type="text"
                  placeholder="Add feedback..."
                  className="mb-2"
                  value={feedback[report.id] || ""}
                  onChange={(e) =>
                    setFeedback({ ...feedback, [report.id]: e.target.value })
                  }
                />
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => handleFeedback(report.id)}
                >
                  Add Feedback
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Classes (view only) */}
      <h4>Classes (View Only)</h4>
      <ul className="list-group">
        {classes.map((c) => (
          <li key={c.id} className="list-group-item">
            {c.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PRLDashboard;
