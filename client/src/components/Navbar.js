import React from 'react';
import './Navbar.css';

const Navbar = ({ account, onConnect, onDisconnect, isLoading, connectError }) => {
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
          <a href="#features" className="nav-link">Features</a>
          <a href="#about" className="nav-link">About</a>
          <a href="#docs" className="nav-link">Docs</a>
          
          {account ? (
            <div className="wallet-section">
              <div className="account-badge">
                <span className="status-dot"></span>
                <span className="account-address">
                  {`${account.slice(0, 6)}...${account.slice(-4)}`}
                </span>
              </div>
              <button className="btn-disconnect" onClick={onDisconnect}>
                Disconnect
              </button>
            </div>
          ) : (
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
