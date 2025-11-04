import React, { useState } from 'react';
import './Login.css';
import axios from 'axios';

const Login = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/login/', formData);
      
      if (response.data.success) {
        // Store user info and token
        localStorage.setItem('userToken', response.data.token);
        localStorage.setItem('userEmail', response.data.email);
        localStorage.setItem('userId', response.data.userId);
        localStorage.setItem('username', response.data.username || 'User');
        onLoginSuccess(response.data);
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.error || 'Login failed. Please try again.');
      } else if (err.request) {
        setError('Cannot connect to server. Please ensure the backend is running.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-branding">
          <div className="auth-logo">🔗</div>
          <h1>BlockShare</h1>
          <p>Your decentralized file storage solution powered by blockchain technology</p>
          
          <div className="auth-features">
            <div className="feature-item">
              <div className="feature-icon">🔒</div>
              <span>End-to-end encrypted storage</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">⚡</div>
              <span>Lightning-fast access</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🌐</div>
              <span>Distributed & secure</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="auth-right">
        <div className="auth-box fade-up">
          <div className="auth-header">
            <div className="auth-icon">🔐</div>
            <h1>Welcome Back</h1>
            <p>Login to access your drive</p>
          </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? 
            <button 
              onClick={onSwitchToRegister} 
              className="link-button"
              disabled={isLoading}
            >
              Register here
            </button>
          </p>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Login;

