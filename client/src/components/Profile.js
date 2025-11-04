import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Profile.css';

const Profile = ({ userInfo, setUserInfo }) => {
  const navigate = useNavigate();
  
  // Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Form states
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [editForm, setEditForm] = useState({
    username: userInfo?.username || '',
    email: userInfo?.email || ''
  });
  
  const [deletePassword, setDeletePassword] = useState('');
  
  // Loading and message states
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // Handle Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage('error', 'New passwords do not match!');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      showMessage('error', 'New password must be at least 6 characters long!');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/change-password/', {
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword
      }, {
        headers: {
          'Authorization': `Bearer ${userInfo.token}`
        }
      });
      
      if (response.data.success) {
        showMessage('success', 'Password changed successfully!');
        setShowPasswordModal(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      showMessage('error', error.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  // Handle Edit Profile
  const handleEditProfile = async (e) => {
    e.preventDefault();
    
    if (!editForm.username.trim() || !editForm.email.trim()) {
      showMessage('error', 'Username and email are required!');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/update-profile/', {
        username: editForm.username,
        email: editForm.email
      }, {
        headers: {
          'Authorization': `Bearer ${userInfo.token}`
        }
      });
      
      if (response.data.success) {
        // Update userInfo state and localStorage
        const updatedUserInfo = {
          ...userInfo,
          username: editForm.username,
          email: editForm.email
        };
        setUserInfo(updatedUserInfo);
        localStorage.setItem('username', editForm.username);
        localStorage.setItem('email', editForm.email);
        
        showMessage('success', 'Profile updated successfully!');
        setShowEditModal(false);
      }
    } catch (error) {
      showMessage('error', error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete Account
  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    
    if (!deletePassword.trim()) {
      showMessage('error', 'Please enter your password to confirm deletion!');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/delete-account/', {
        password: deletePassword
      }, {
        headers: {
          'Authorization': `Bearer ${userInfo.token}`
        }
      });
      
      if (response.data.success) {
        // Clear all stored data
        localStorage.clear();
        showMessage('success', 'Account deleted successfully. Redirecting...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      showMessage('error', error.response?.data?.error || 'Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        {message.text && (
          <div className={`message-notification ${message.type}`}>
            {message.text}
          </div>
        )}
        
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
              <button 
                className="action-btn primary" 
                onClick={() => setShowPasswordModal(true)}
              >
                <span>🔒</span>
                Change Password
              </button>
              <button 
                className="action-btn secondary" 
                onClick={() => {
                  setEditForm({ username: userInfo?.username || '', email: userInfo?.email || '' });
                  setShowEditModal(true);
                }}
              >
                <span>✏️</span>
                Edit Profile
              </button>
              <button 
                className="action-btn danger" 
                onClick={() => setShowDeleteModal(true)}
              >
                <span>🗑️</span>
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Change Password</h2>
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
              <div className="modal-buttons">
                <button type="button" onClick={() => setShowPasswordModal(false)} disabled={loading}>
                  Cancel
                </button>
                <button type="submit" className="primary" disabled={loading}>
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Profile</h2>
            <form onSubmit={handleEditProfile}>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
              <div className="modal-buttons">
                <button type="button" onClick={() => setShowEditModal(false)} disabled={loading}>
                  Cancel
                </button>
                <button type="submit" className="primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content danger-modal" onClick={(e) => e.stopPropagation()}>
            <h2>⚠️ Delete Account</h2>
            <p className="warning-text">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
            <form onSubmit={handleDeleteAccount}>
              <div className="form-group">
                <label>Enter your password to confirm</label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Your password"
                />
              </div>
              <div className="modal-buttons">
                <button type="button" onClick={() => setShowDeleteModal(false)} disabled={loading}>
                  Cancel
                </button>
                <button type="submit" className="danger" disabled={loading}>
                  {loading ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

