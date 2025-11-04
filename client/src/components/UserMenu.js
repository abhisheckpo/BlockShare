import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserMenu.css';

const UserMenu = ({ userInfo, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    setIsOpen(false);
    navigate('/profile');
  };

  const handleLogoutClick = () => {
    setIsOpen(false);
    onLogout();
  };

  return (
    <div className="user-menu" ref={menuRef}>
      <button 
        className="user-menu-trigger" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User menu"
      >
        <div className="user-avatar">
          <span className="avatar-icon">👤</span>
        </div>
      </button>

      {isOpen && (
        <div className="user-menu-dropdown">
          <div className="dropdown-header">
            <div className="dropdown-avatar">
              <span className="avatar-icon-large">👤</span>
            </div>
            <div className="dropdown-user-info">
              <div className="dropdown-username">{userInfo?.username || 'User'}</div>
              <div className="dropdown-email">{userInfo?.email}</div>
            </div>
          </div>

          <div className="dropdown-divider"></div>

          <div className="dropdown-menu-items">
            <button className="dropdown-menu-item" onClick={handleProfileClick}>
              <span className="menu-item-icon">⚙️</span>
              <span>Profile Settings</span>
            </button>
            
            <button className="dropdown-menu-item logout" onClick={handleLogoutClick}>
              <span className="menu-item-icon">🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;

