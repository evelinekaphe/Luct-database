import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Auth from './Auth';
import Dashboard from './Dashboard';
import ReportForm from './ReportForm';
import './App.css';

import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));

  const handleLogin = (newToken, newRole) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('role', newRole);
    setToken(newToken);
    setRole(newRole);
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setRole(null);
  };

  return (
    <Router>
      <div className="container" style={{ minHeight: '100vh' }}>
        <nav className="navbar navbar-light bg-light">
          <span className="navbar-brand"><marquee>LUCT Reporting App</marquee></span>
          {token && (
            <button className="btn btn-danger" onClick={handleLogout}>
              Logout
            </button>
          )}
        </nav>
        <Routes>
          <Route path="/auth" element={<Auth onLogin={handleLogin} />} />
          {token && role === 'lecturer' && (
            <Route path="/report" element={<ReportForm token={token} />} />
          )}
          {token && <Route path="/dashboard" element={<Dashboard token={token} role={role} />} />}
          <Route path="*" element={<Navigate to="/auth" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;