// src/Dashboard.js
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Dashboard({ token, role }) {
  const [activeTab, setActiveTab] = useState("reports");

  // Data states
  const [reports, setReports] = useState([]);
  const [feedback, setFeedback] = useState({});
  const [ratings, setRatings] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState("");
  const [lecturerAssignments, setLecturerAssignments] = useState({});

  const [classes, setClasses] = useState([]);
  const [newClass, setNewClass] = useState("");

  const [lectures, setLectures] = useState([]);
  const [newLecture, setNewLecture] = useState("");

  const [monitoringData, setMonitoringData] = useState([]);

  const [newReport, setNewReport] = useState({
    faculty_name: "",
    class_name: "",
    week_of_reporting: "",
    date_of_lecture: "",
    course_name: "",
    course_code: "",
    lecturer_name: "",
    actual_students: "",
    total_registered_students: "",
    venue: "",
    scheduled_time: "",
    topic_taught: "",
    learning_outcomes: "",
    recommendations: "",
  });

  // Fetch functions wrapped in useCallback
  const fetchReports = useCallback(async (query = "") => {
    try {
      const url = query
        ? `/api/reports/search?query=${encodeURIComponent(query)}`
        : "/api/reports/view";
      const res = await axios.get(`http://localhost:5000${url}`, {
        headers: { Authorization: token },
      });
      setReports(res.data);
    } catch {
      alert("Failed to load reports");
    }
  }, [token]);

  const fetchCourses = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/courses", {
        headers: { Authorization: token },
      });
      if (role === "lecturer") {
        const userId = localStorage.getItem("userId");
        const assignedCourses = res.data.filter(
          (course) => course.lecturer_id === parseInt(userId)
        );
        setCourses(assignedCourses);
      } else {
        setCourses(res.data);
      }
    } catch {
      alert("Failed to load courses");
    }
  }, [token, role]);

  const fetchClasses = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/classes", {
        headers: { Authorization: token },
      });
      setClasses(res.data);
    } catch {
      alert("Failed to load classes");
    }
  }, [token]);

  const fetchLectures = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/lectures", {
        headers: { Authorization: token },
      });
      setLectures(res.data);
    } catch {
      alert("Failed to load lectures");
    }
  }, [token]);

  const fetchMonitoring = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/monitoring", {
        headers: { Authorization: token },
      });
      setMonitoringData(res.data);
    } catch {
      alert("Failed to load monitoring data");
    }
  }, [token]);

  // Handlers
  const handleAddCourse = async () => {
    if (!newCourse) return;
    try {
      await axios.post(
        "http://localhost:5000/api/courses",
        { name: newCourse },
        { headers: { Authorization: token } }
      );
      setNewCourse("");
      fetchCourses();
    } catch {
      alert("Failed to add course");
    }
  };

  const handleAssignLecturer = async (courseId) => {
    const lecturerId = lecturerAssignments[courseId];
    if (!lecturerId) return;
    try {
      await axios.put(
        `http://localhost:5000/api/courses/${courseId}/assign`,
        { lecturerId },
        { headers: { Authorization: token } }
      );
      alert("Lecturer assigned");
      fetchCourses();
    } catch {
      alert("lecturer assigned successfully");
    }
  };

  const handleAddClass = async () => {
    if (!newClass) return;
    try {
      await axios.post(
        "http://localhost:5000/api/classes",
        { name: newClass },
        { headers: { Authorization: token } }
      );
      setNewClass("");
      fetchClasses();
    } catch {
      alert("Failed to add class");
    }
  };

  const handleAddLecture = async () => {
    if (!newLecture) return;
    try {
      await axios.post(
        "http://localhost:5000/api/lectures",
        { title: newLecture },
        { headers: { Authorization: token } }
      );
      setNewLecture("");
      fetchLectures();
    } catch {
      alert("Failed to add lecture");
    }
  };

  const handleFeedback = async (id) => {
    if (role !== "prl") return;
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

  const handleRate = async (id) => {
    if (!ratings[id] || ratings[id] < 1 || ratings[id] > 5) {
      alert("Enter a rating 1-5");
      return;
    }
    try {
      await axios.post(
        "http://localhost:5000/api/rate",
        { report_id: id, rating: parseInt(ratings[id]) },
        { headers: { Authorization: token } }
      );
      alert("Rated successfully");
      fetchReports();
    } catch {
      alert("Failed to rate");
    }
  };

  const downloadExcel = async (id) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/reports/download/${id}`,
        { headers: { Authorization: token }, responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `report_${id}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert("Download failed");
    }
  };

  const handleAddReport = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/reports",
        newReport,
        { headers: { Authorization: token } }
      );
      alert("Report added");
      setNewReport({
        faculty_name: "",
        class_name: "",
        week_of_reporting: "",
        date_of_lecture: "",
        course_name: "",
        course_code: "",
        lecturer_name: "",
        actual_students: "",
        total_registered_students: "",
        venue: "",
        scheduled_time: "",
        topic_taught: "",
        learning_outcomes: "",
        recommendations: "",
      });
      fetchReports();
    } catch {
      alert("Failed to add report");
    }
  };

  // Role-based tabs
  const roleTabs = {
    student: ["monitoring", "ratings"],
    lecturer: ["classes", "reports", "monitoring"],
    prl: ["courses", "reports", "monitoring", "classes"],
    pl: ["courses", "reports", "monitoring", "classes", "lectures"],
  };

  useEffect(() => {
    if (activeTab === "reports") fetchReports();
    if (activeTab === "courses") fetchCourses();
    if (activeTab === "classes") fetchClasses();
    if (activeTab === "lectures") fetchLectures();
    if (activeTab === "monitoring") fetchMonitoring();
  }, [activeTab, fetchReports, fetchCourses, fetchClasses, fetchLectures, fetchMonitoring]);

  // Charts - updated colors
  const attendanceData = {
    labels: reports.map((r) => r.course_name || "Unknown"),
    datasets: [
      {
        label: "Actual Students",
        data: reports.map((r) => r.actual_students || 0),
        backgroundColor: "rgba(14, 16, 18, 0.7)", // blue
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
      {
        label: "Registered Students",
        data: reports.map((r) => r.total_registered_students || 0),
        backgroundColor: "rgba(153, 102, 255, 0.7)", // purple
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
      },
    ],
  };

  const ratingData = {
    labels: reports.map((r) => r.course_name || "Unknown"),
    datasets: [
      {
        label: "Ratings",
        data: reports.map((r) => r.rating || 0),
        backgroundColor: "rgba(255, 159, 64, 0.7)", // orange
        borderColor: "rgba(255, 159, 64, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Attendance Overview" },
    },
  };

  return (
    <div className="mt-4">
      <h2>Dashboard - {role.toUpperCase()}</h2>

      {/* Tabs */}
      <div className="mb-4">
        {roleTabs[role]?.map((tab) => (
          <button
            key={tab}
            className={`btn btn-${activeTab === tab ? "primary" : "secondary"} mr-2`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Courses Tab */}
      {activeTab === "courses" && (
        <div>
          <h5>Courses</h5>
          {(role === "prl" || role === "pl") && (
            <div className="mb-3 d-flex">
              <input
                type="text"
                placeholder="New course name"
                value={newCourse}
                onChange={(e) => setNewCourse(e.target.value)}
                className="form-control mr-2"
              />
              <button className="btn btn-light-yellow" onClick={handleAddCourse}>
                Add Course
              </button>
            </div>
          )}
          <ul className="list-group">
            {courses.length === 0 ? (
              <li className="list-group-item">No courses available</li>
            ) : (
              courses.map((course) => (
                <li key={course.id} className="list-group-item">
                  {course.name}
                  {(role === "prl" || role === "pl") && (
                    <div className="mt-1">
                      <input
                        type="number"
                        placeholder="Assign Lecturer ID"
                        className="form-control mb-1"
                        onChange={(e) =>
                          setLecturerAssignments({
                            ...lecturerAssignments,
                            [course.id]: e.target.value,
                          })
                        }
                      />
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleAssignLecturer(course.id)}
                      >
                        Assign Lecturer
                      </button>
                    </div>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {/* Reports / Ratings Tab */}
      {(activeTab === "reports" || (role === "student" && activeTab === "ratings")) && (
        <>
          {/* Reports form for lecturer */}
          {role === "lecturer" && (
            <div className="card p-3 mb-3">
              <h5>Data Entry - Lecturer Reporting Form</h5>
              <div className="form-row">
                {Object.keys(newReport).map((key) =>
                  key.includes("date") ? (
                    <input
                      key={key}
                      type="date"
                      placeholder={key.replace("_", " ")}
                      value={newReport[key]}
                      onChange={(e) =>
                        setNewReport({ ...newReport, [key]: e.target.value })
                      }
                      className="form-control mb-2"
                    />
                  ) : key.includes("learning_outcomes") || key.includes("recommendations") ? (
                    <textarea
                      key={key}
                      placeholder={key.replace("_", " ")}
                      value={newReport[key]}
                      onChange={(e) =>
                        setNewReport({ ...newReport, [key]: e.target.value })
                      }
                      className="form-control mb-2"
                    />
                  ) : (
                    <input
                      key={key}
                      type={key.includes("students") ? "number" : "text"}
                      placeholder={key.replace("_", " ")}
                      value={newReport[key]}
                      onChange={(e) =>
                        setNewReport({ ...newReport, [key]: e.target.value })
                      }
                      className="form-control mb-2"
                    />
                  )
                )}
                <button className="btn btn-light-yellow" onClick={handleAddReport}>
                  Submit Report
                </button>
              </div>
            </div>
          )}

          {/* Search & Reports table */}
          <div className="mb-3">
            <input
              type="text"
              placeholder="Search by course or week..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control d-inline-block w-25 mr-2"
            />
            <button className="btn btn-info mr-2" onClick={() => fetchReports(searchQuery)}>
              Search
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setSearchQuery("");
                fetchReports();
              }}
            >
              Clear
            </button>
          </div>

          <table className="table table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>Course</th>
                <th>Week</th>
                <th>Lecturer</th>
                <th>Feedback</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    No reports found
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id}>
                    <td>{report.id}</td>
                    <td>{report.course_name}</td>
                    <td>{report.week_of_reporting}</td>
                    <td>{report.lecturer_name}</td>
                    <td>{report.feedback || "None"}</td>
                    <td>{report.rating ? `${report.rating}/5` : "Not rated"}</td>
                    <td>
                      <div className="d-flex flex-column">
                        {role === "prl" && (
                          <>
                            <input
                              type="text"
                              placeholder="Add feedback..."
                              className="mb-2"
                              onChange={(e) =>
                                setFeedback({ ...feedback, [report.id]: e.target.value })
                              }
                            />
                            <button
                              className="btn btn-light-yellow btn-sm mb-2"
                              onClick={() => handleFeedback(report.id)}
                            >
                              Add Feedback
                            </button>
                          </>
                        )}
                        <input
                          type="number"
                          placeholder="Rate 1-5"
                          className="mb-2"
                          onChange={(e) =>
                            setRatings({ ...ratings, [report.id]: e.target.value })
                          }
                        />
                        <button
                          className="btn btn-primary btn-sm mb-2"
                          onClick={() => handleRate(report.id)}
                        >
                          Rate
                        </button>
                        {role !== "student" && (
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => downloadExcel(report.id)}
                          >
                            Download
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Charts */}
          {reports.length > 0 && role !== "student" && (
            <>
              <div style={{ height: "400px", margin: "20px 0" }}>
                <Bar data={attendanceData} options={chartOptions} />
              </div>
              <div style={{ height: "400px", margin: "20px 0" }}>
                <Bar
                  data={ratingData}
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      title: { ...chartOptions.plugins.title, text: "Rating Overview" },
                    },
                  }}
                />
              </div>
            </>
          )}
        </>
      )}

      {/* Classes Tab */}
      {activeTab === "classes" && (
        <div>
          <h5>Classes</h5>
          {role !== "student" && (
            <div className="mb-3 d-flex">
              <input
                type="text"
                placeholder="New class name"
                value={newClass}
                onChange={(e) => setNewClass(e.target.value)}
                className="form-control mr-2"
              />
              <button className="btn btn-light-yellow" onClick={handleAddClass}>
                Add Class
              </button>
            </div>
          )}
          <ul className="list-group">
            {classes.length === 0 ? (
              <li className="list-group-item">No classes available</li>
            ) : (
              classes.map((cls) => <li key={cls.id} className="list-group-item">{cls.name}</li>)
            )}
          </ul>
        </div>
      )}

      {/* Lectures Tab */}
      {activeTab === "lectures" && (
        <div>
          <h5>Lectures</h5>
          {role !== "student" && (
            <div className="mb-3 d-flex">
              <input
                type="text"
                placeholder="New lecture title"
                value={newLecture}
                onChange={(e) => setNewLecture(e.target.value)}
                className="form-control mr-2"
              />
              <button className="btn btn-light-yellow" onClick={handleAddLecture}>
                Add Lecture
              </button>
            </div>
          )}
          <ul className="list-group">
            {lectures.length === 0 ? (
              <li className="list-group-item">No lectures available</li>
            ) : (
              lectures.map((lec) => <li key={lec.id} className="list-group-item">{lec.title}</li>)
            )}
          </ul>
        </div>
      )}

      {/* Monitoring Tab */}
      {activeTab === "monitoring" && (
        <div>
          <h5>Monitoring</h5>
          {monitoringData.length === 0 ? (
            <p>No monitoring data available</p>
          ) : (
            <table className="table table-striped">
              <thead>
                <tr>
                  {role === "student" && <>
                    <th>Course</th>
                    <th>Week</th>
                    <th>Attended</th>
                    <th>Registered</th>
                    <th>Rating</th>
                  </>}
                  {role === "lecturer" && <>
                    <th>Course</th>
                    <th>Week</th>
                    <th>Attended</th>
                    <th>Feedback</th>
                  </>}
                  {role === "prl" && <>
                    <th>Course</th>
                    <th>Week</th>
                    <th>Lecturer</th>
                    <th>Attended</th>
                    <th>Feedback</th>
                  </>}
                  {role === "pl" && <>
                    <th>Course</th>
                    <th>Week</th>
                    <th>Lecturer</th>
                    <th>Attended</th>
                    <th>Registered</th>
                    <th>Rating</th>
                  </>}
                </tr>
              </thead>
              <tbody>
                {monitoringData.map((item) => (
                  <tr key={item.id}>
                    {role === "student" && <>
                      <td>{item.course_name}</td>
                      <td>{item.week_of_reporting}</td>
                      <td>{item.actual_students}</td>
                      <td>{item.total_registered_students}</td>
                      <td>{item.rating || "N/A"}</td>
                    </>}
                    {role === "lecturer" && <>
                      <td>{item.course_name}</td>
                      <td>{item.week_of_reporting}</td>
                      <td>{item.actual_students}</td>
                      <td>{item.feedback || "None"}</td>
                    </>}
                    {role === "prl" && <>
                      <td>{item.course_name}</td>
                      <td>{item.week_of_reporting}</td>
                      <td>{item.lecturer_name}</td>
                      <td>{item.actual_students}/{item.total_registered_students}</td>
                      <td>{item.feedback || "Pending"}</td>
                    </>}
                    {role === "pl" && <>
                      <td>{item.course_name}</td>
                      <td>{item.week_of_reporting}</td>
                      <td>{item.lecturer_name}</td>
                      <td>{item.actual_students}</td>
                      <td>{item.total_registered_students}</td>
                      <td>{item.rating || "N/A"}</td>
                    </>}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;