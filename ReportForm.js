// src/components/ReportForm.js - Lecturer form (simplified)
import React, { useState } from 'react';
import axios from 'axios';

function ReportForm({ token }) {
  const [formData, setFormData] = useState({
    faculty_name: '', class_name: '', week_of_reporting: '', date_of_lecture: '',
    course_name: '', course_code: '', lecturer_name: '', actual_students: '',
    total_registered_students: '', venue: '', scheduled_time: '', topic_taught: '',
    learning_outcomes: '', recommendations: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/reports/submit', formData, { headers: { Authorization: token } });
      alert('Submitted!');
    } catch (err) {
      alert('Failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="form-group"><label>Faculty Name</label><input name="faculty_name" type="text" className="form-control" onChange={handleChange} /></div>
      <div className="form-group"><label>Class Name</label><input name="class_name" type="text" className="form-control" onChange={handleChange} /></div>
      <div className="form-group"><label>Week</label><input name="week_of_reporting" type="number" className="form-control" onChange={handleChange} /></div>
      <div className="form-group"><label>Date</label><input name="date_of_lecture" type="date" className="form-control" onChange={handleChange} /></div>
      <div className="form-group"><label>Course Name</label><input name="course_name" type="text" className="form-control" onChange={handleChange} /></div>
      <div className="form-group"><label>Course Code</label><input name="course_code" type="text" className="form-control" onChange={handleChange} /></div>
      <div className="form-group"><label>Lecturer Name</label><input name="lecturer_name" type="text" className="form-control" onChange={handleChange} /></div>
      <div className="form-group"><label>Actual Students</label><input name="actual_students" type="number" className="form-control" onChange={handleChange} /></div>
      <div className="form-group"><label>Total Registered</label><input name="total_registered_students" type="number" className="form-control" onChange={handleChange} /></div>
      <div className="form-group"><label>Venue</label><input name="venue" type="text" className="form-control" onChange={handleChange} /></div>
      <div className="form-group"><label>Time</label><input name="scheduled_time" type="time" className="form-control" onChange={handleChange} /></div>
      <div className="form-group"><label>Topic</label><textarea name="topic_taught" className="form-control" onChange={handleChange} /></div>
      <div className="form-group"><label>Outcomes</label><textarea name="learning_outcomes" className="form-control" onChange={handleChange} /></div>
      <div className="form-group"><label>Recommendations</label><textarea name="recommendations" className="form-control" onChange={handleChange} /></div>
      <button type="submit" className="btn btn-primary">Submit</button>
    </form>
  );
}

export default ReportForm;