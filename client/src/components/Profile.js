import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = ({ userInfo }) => {
  const navigate = useNavigate();

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <button className="back-button" onClick={() => navigate('/dashboard')}>
            <span>←</span> Back to Dashboard
          </button>
          <h1>Profile Settings</h1>
          <p>Manage your account information</p>
        </div>

        <div className="profile-content">
          <div className="profile-card">
            <div className="profile-avatar-section">
              <div className="profile-avatar-large">
                <span className="avatar-icon-xl">👤</span>
              </div>
              <button className="change-avatar-btn">Change Avatar</button>
            </div>

            <div className="profile-info-section">
              <h2>Account Information</h2>
              
              <div className="info-grid">
                <div className="info-item">
                  <label className="info-label">Username</label>
                  <div className="info-value">
                    <span className="info-icon">👤</span>
                    <span>{userInfo?.username || 'N/A'}</span>
                  </div>
                </div>

                <div className="info-item">
                  <label className="info-label">Email Address</label>
                  <div className="info-value">
                    <span className="info-icon">📧</span>
                    <span>{userInfo?.email || 'N/A'}</span>
                  </div>
                </div>

                <div className="info-item">
                  <label className="info-label">User ID</label>
                  <div className="info-value">
                    <span className="info-icon">🔑</span>
                    <span>#{userInfo?.userId || 'N/A'}</span>
                  </div>
                </div>

                <div className="info-item">
                  <label className="info-label">Account Status</label>
                  <div className="info-value">
                    <span className="status-badge active">
                      <span className="status-dot"></span>
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-actions-card">
            <h3>Account Actions</h3>
            <div className="action-buttons">
              <button className="action-btn primary">
                <span>🔒</span>
                Change Password
              </button>
              <button className="action-btn secondary">
                <span>✏️</span>
                Edit Profile
              </button>
              <button className="action-btn danger">
                <span>🗑️</span>
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

