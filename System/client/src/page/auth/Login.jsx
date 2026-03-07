import axios from 'axios';
import React, { useState } from 'react'
import { saveTokens } from '../../services/auth';
import { Navigate, useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate()
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(`http://127.0.0.1:8000/api/user/login/`, { username, password });
      const userData = res.data.user;

      saveTokens(res.data.access, res.data.refresh, userData)
      setTimeout(() => {
        if (userData.user_type == "Admin") navigate("/director/dashboard")
        if (userData.user_type == "Student") navigate("/student/dashboard")
        if (userData.user_type == "Teacher") navigate("/hod/staff/dashboard")
      }, 1000);

    } catch (err) {
      console.error("Login failed: ", err);
      setError("Invalid credentials. Please try again.");
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <div className="auth-header">
          <h2>University Portal</h2>
          <p>Please sign in to access your dashboard</p>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>{error}</div>}
          <div className="form-group">
            <label>Phone / Email</label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}>
            Sign In
          </button>
        </form>
        <div className="helper-text">
          <p><a href="#">Forgot your password?</a></p>
          <p>Contact IT Support for assistance.</p>
        </div>
      </div>
    </div>
  )
}

export default Login
