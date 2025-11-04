import React, { useState } from 'react';
import './Login.css';
import axios from 'axios';

const Register = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
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
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters');
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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Password strength validation
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/register/', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      if (response.data.success) {
        // Auto-login after successful registration
        localStorage.setItem('userToken', response.data.token);
        localStorage.setItem('userEmail', response.data.email);
        localStorage.setItem('userId', response.data.userId);
        localStorage.setItem('username', response.data.username || 'User');
        onRegisterSuccess(response.data);
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.error || 'Registration failed. Please try again.');
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
            <div className="auth-icon">📝</div>
            <h1>Create Account</h1>
            <p>Join BlockShare today</p>
          </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              disabled={isLoading}
            />
          </div>

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
              placeholder="Create a password"
              disabled={isLoading}
            />
            <small className="form-hint">
              Must be 6+ characters with uppercase, lowercase, and number
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? 
            <button 
              onClick={onSwitchToLogin} 
              className="link-button"
              disabled={isLoading}
            >
              Login here
            </button>
          </p>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Register;

