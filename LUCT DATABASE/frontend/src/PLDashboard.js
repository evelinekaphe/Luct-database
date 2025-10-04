// src/components/PLDashboard.js
import React, { useState, useEffect } from "react";
import axios from "axios";

function PLDashboard({ token }) {
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [lectures, setLectures] = useState([]);

  const [newCourse, setNewCourse] = useState("");
  const [newClass, setNewClass] = useState("");
  const [newLecture, setNewLecture] = useState("");

  // Fetch Courses
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

  // Fetch Classes
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

  // Fetch Lectures
  const fetchLectures = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/lectures", {
        headers: { Authorization: token },
      });
      setLectures(res.data);
    } catch {
      alert("Failed to load lectures");
    }
  };

  // Initial load
  useEffect(() => {
    fetchCourses();
    fetchClasses();
    fetchLectures();
  }, []);

  // Add Course
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

  // Add Class
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

  // Add Lecture
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

  return (
    <div>
      <h2>Dashboard - PL</h2>

      {/* Courses Section */}
      <div className="mb-4">
        <h4>Manage Courses</h4>
        <div className="mb-3 d-flex">
          <input
            type="text"
            placeholder="New Course Name"
            value={newCourse}
            onChange={(e) => setNewCourse(e.target.value)}
            className="form-control mr-2"
          />
          <button className="btn btn-primary" onClick={handleAddCourse}>
            Add Course
          </button>
        </div>
        <ul className="list-group">
          {courses.map((c) => (
            <li key={c.id} className="list-group-item">
              {c.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Classes Section */}
      <div className="mb-4">
        <h4>Manage Classes</h4>
        <div className="mb-3 d-flex">
          <input
            type="text"
            placeholder="New Class Name"
            value={newClass}
            onChange={(e) => setNewClass(e.target.value)}
            className="form-control mr-2"
          />
          <button className="btn btn-primary" onClick={handleAddClass}>
            Add Class
          </button>
        </div>
        <ul className="list-group">
          {classes.map((c) => (
            <li key={c.id} className="list-group-item">
              {c.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Lectures Section */}
      <div className="mb-4">
        <h4>Manage Lectures</h4>
        <div className="mb-3 d-flex">
          <input
            type="text"
            placeholder="Lecture Title"
            value={newLecture}
            onChange={(e) => setNewLecture(e.target.value)}
            className="form-control mr-2"
          />
          <button className="btn btn-primary" onClick={handleAddLecture}>
            Add Lecture
          </button>
        </div>
        <ul className="list-group">
          {lectures.map((l) => (
            <li key={l.id} className="list-group-item">
              {l.title}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default PLDashboard;
