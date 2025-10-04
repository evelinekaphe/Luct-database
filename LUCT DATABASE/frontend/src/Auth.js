// src/components/Auth.js - Combined Login/Register
import React, { useState } from "react";
import axios from "axios";

function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true); // Toggle login/register
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [faculty_name, setFacultyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        // ---- LOGIN ----
        const res = await axios.post("http://localhost:5000/api/auth/login", {
          username,
          password,
        });

        // Store token + role
        onLogin(res.data.token, res.data.role);

        // Redirect to dashboard
        window.location.href = "/dashboard";
      } else {
        // ---- REGISTER ----
        await axios.post("http://localhost:5000/api/auth/register", {
          username,
          password,
          role,
          faculty_name,
        });

        alert("Registered successfully! Please login now.");
        setIsLogin(true);
        setUsername("");
        setPassword("");
        setFacultyName("");
        setRole("student");
      }
    } catch (err) {
      console.error("Auth error:", err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <h2>{isLogin ? "Login" : "Register"}</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Username */}
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        {/* Password */}
        <div className="form-group mt-2">
          <label>Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Extra fields for Register */}
        {!isLogin && (
          <>
            <div className="form-group mt-2">
              <label>Role</label>
              <select
                className="form-control"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="student">Student</option>
                <option value="lecturer">Lecturer</option>
                <option value="prl">PRL</option>
                <option value="pl">PL</option>
              </select>
            </div>

            <div className="form-group mt-2">
              <label>Faculty Name</label>
              <input
                type="text"
                className="form-control"
                value={faculty_name}
                onChange={(e) => setFacultyName(e.target.value)}
              />
            </div>
          </>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="btn btn-primary mt-3"
          disabled={loading}
        >
          {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
        </button>
      </form>

      {/* Toggle Button */}
      <button
        onClick={() => setIsLogin(!isLogin)}
        className="btn btn-link mt-2"
      >
        {isLogin ? "Need to register?" : "Already registered? Login"}
      </button>
    </div>
  );
}

export default Auth;
