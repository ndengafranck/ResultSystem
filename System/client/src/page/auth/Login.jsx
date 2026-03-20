import axios from 'axios';
import React, { useState } from 'react';
import { saveTokens } from '../../services/auth';
import { useNavigate } from 'react-router-dom';
import { Alert, Spinner } from '../../components/UI';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res      = await axios.post('http://127.0.0.1:8000/api/user/login/', { username, password });
      const userData = res.data.user;
      saveTokens(res.data.access, res.data.refresh, userData);
      setTimeout(() => {
        if (userData.user_type === 'Admin')   navigate('/director/dashboard');
        if (userData.user_type === 'Student') navigate('/student/dashboard');
        if (userData.user_type === 'Teacher') navigate('/hod/staff/dashboard');
      }, 800);
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.response?.data?.detail || 'Invalid credentials. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <div className="auth-header">
          <h2>University Portal</h2>
          <p>Sign in to access your dashboard</p>
        </div>

        {error && (
          <Alert variant="error" mb="1rem">{error}</Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Phone / Email</label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.6rem' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner size="18px" stroke="2px" />
                Signing in…
              </>
            ) : 'Sign In'}
          </button>
        </form>

        <div className="helper-text">
          <p><a href="#">Forgot your password?</a></p>
          <p>Contact IT Support for assistance.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
