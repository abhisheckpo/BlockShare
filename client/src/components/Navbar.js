import React from 'react';
import './Navbar.css';
import ThemeToggle from './ThemeToggle';

const Navbar = ({ account, onConnect, onDisconnect, isLoading, connectError, userInfo, onLogout }) => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <div className="logo">
            <span className="logo-icon">🔗</span>
            <span className="logo-text">BlockShare</span>
          </div>
          <span className="tagline">Decentralized File Storage</span>
        </div>

        <div className="navbar-menu">
          <ThemeToggle />
          
          {userInfo && (
            <>
              <div className="user-info">
                <span className="user-icon">👤</span>
                <span className="user-email">{userInfo.email}</span>
              </div>
            </>
          )}
          
          {account ? (
            <div className="wallet-section">
              <div className="account-badge">
                <span className="status-dot"></span>
                <span className="account-address">
                  {`${account.slice(0, 6)}...${account.slice(-4)}`}
                </span>
              </div>
              <button className="btn-disconnect" onClick={onDisconnect}>
                Disconnect Wallet
              </button>
            </div>
          ) : userInfo ? (
            <button 
              className={`btn-connect ${isLoading ? 'loading' : ''}`}
              onClick={onConnect}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Connecting...
                </>
              ) : (
                <>
                  <span className="wallet-icon">🦊</span>
                  Connect Wallet
                </>
              )}
            </button>
          ) : null}
          
          {userInfo && onLogout && (
            <button className="btn-logout" onClick={onLogout}>
              Logout
            </button>
          )}
        </div>
      </div>
      
      {!account && connectError && (
        <div className="navbar-error">{connectError}</div>
      )}
    </nav>
  );
};

export default Navbar;
