import { useEffect, useState } from "react";
import "./Modal.css";

const Modal = ({ setModalOpen, contract }) => {
  const [isSharing, setIsSharing] = useState(false);
  const [shareStatus, setShareStatus] = useState(null);
  const [accessList, setAccessList] = useState([]);
  const [address, setAddress] = useState("");
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => setModalOpen(false), 300);
  };

  const sharing = async () => {
    if (!address.trim()) {
      setShareStatus({ type: 'error', message: 'Please enter an address' });
      return;
    }

    setIsSharing(true);
    setShareStatus(null);

    try {
      await contract.allow(address);
      setShareStatus({ type: 'success', message: 'Access granted successfully!' });
      
      // Update access list
      const newList = await contract.shareAccess();
      setAccessList(newList);
      
      // Clear input
      setAddress("");
      
      // Close modal after success
      setTimeout(handleClose, 1500);
    } catch (error) {
      console.error('Sharing failed:', error);
      setShareStatus({ 
        type: 'error', 
        message: 'Failed to grant access. Please check the address and try again.' 
      });
    } finally {
      setIsSharing(false);
    }
  };

  useEffect(() => {
    const loadAccessList = async () => {
      try {
        const list = await contract.shareAccess();
        setAccessList(list);
      } catch (error) {
        console.error('Failed to load access list:', error);
      }
    };

    if (contract) {
      loadAccessList();
    }
  }, [contract]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <div 
      className={`modalBackground ${isClosing ? 'closing' : ''}`}
      onClick={handleClose}
    >
      <div 
        className={`modalContainer ${isClosing ? 'closing' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="modalHeader">
          <h2 className="title">Share Access</h2>
          <button className="closeButton" onClick={handleClose}>×</button>
        </div>

        <div className="body">
          <div className="input-group">
            <label htmlFor="shareAddress">Share with address:</label>
            <input
              id="shareAddress"
              type="text"
              className="address"
              placeholder="Enter Ethereum address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={isSharing}
            />
          </div>

          {shareStatus && (
            <div className={`status-message ${shareStatus.type}`}>
              <span className="status-icon">
                {shareStatus.type === 'success' ? '✓' : '⚠'}
              </span>
              {shareStatus.message}
            </div>
          )}

          <div className="access-list">
            <h3>People with access</h3>
            {accessList.length > 0 ? (
              <ul className="address-list">
                {accessList.map((addr, index) => (
                  <li key={index} className="address-item">
                    <span className="address-icon">👤</span>
                    <span className="address-text">{addr}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-access">No addresses have been granted access yet</p>
            )}
          </div>
        </div>

        <div className="footer">
          <button
            className="cancelBtn"
            onClick={handleClose}
            disabled={isSharing}
          >
            Cancel
          </button>
          <button
            className={`shareBtn ${isSharing ? 'loading' : ''} ${shareStatus?.type === 'success' ? 'success' : ''}`}
            onClick={sharing}
            disabled={isSharing || !address.trim()}
          >
            {isSharing ? (
              <span className="loading-text">Sharing...</span>
            ) : shareStatus?.type === 'success' ? (
              <span className="success-text">Shared! ✓</span>
            ) : (
              'Share Access'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;