import Upload from "./artifacts/contracts/Upload.sol/Upload.json";
import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FileUpload from "./components/FileUpload";
import Display from "./components/Display";
import Modal from "./components/Modal";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import "./App.css";

function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('gallery');
  const [connectError, setConnectError] = useState("");
  const [manualAddress, setManualAddress] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const networkSwitchInFlightRef = useRef(false);

  const getInjectedEthereum = () => {
    const eth = window.ethereum;
    if (!eth) return undefined;
    // Prefer MetaMask if multiple providers injected
    if (eth.providers && Array.isArray(eth.providers)) {
      const metamask = eth.providers.find((p) => p.isMetaMask);
      return metamask || eth.providers[0];
    }
    return eth;
  };

  // Ensure MetaMask is on Hardhat Localhost 8545 (chainId 31337) with single-flight guard
  const ensureHardhatNetwork = async () => {
    const injected = getInjectedEthereum();
    if (!injected) return;
    if (networkSwitchInFlightRef.current) return; // avoid duplicate prompts
    try {
      networkSwitchInFlightRef.current = true;
      const currentChainId = await injected.request({ method: "eth_chainId" });
      if (currentChainId === "0x7a69") return; // already on 31337

      // Try to switch first
      try {
        await injected.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x7a69" }],
        });
        return;
      } catch (switchError) {
        // If chain is unrecognized, add it, then switch
        if (switchError && switchError.code === 4902) {
          try {
            await injected.request({
              method: "wallet_addEthereumChain",
              params: [{
                chainId: "0x7a69",
                chainName: "Hardhat Localhost 8545",
                rpcUrls: ["http://127.0.0.1:8545", "http://localhost:8545"],
                nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
              }],
            });
            // Switch after adding
            await injected.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: "0x7a69" }],
            });
            return;
          } catch (addError) {
            // If a request is already pending, surface a gentle hint and exit
            if (addError && addError.code === -32002) {
              console.warn("Network add/switch request already pending in MetaMask. Please approve it.");
              setConnectError("Open MetaMask and approve the pending network request.");
            }
            throw addError;
          }
        }
        // If another pending request (-32002), hint and return
        if (switchError && switchError.code === -32002) {
          console.warn("Network switch request already pending in MetaMask. Please approve it.");
          setConnectError("Open MetaMask and approve the pending network request.");
          return;
        }
        throw switchError;
      }
    } catch (e) {
      // Keep errors non-fatal; connection flow can still continue
      console.warn("ensureHardhatNetwork failed:", e);
    } finally {
      networkSwitchInFlightRef.current = false;
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      const injected = getInjectedEthereum();
      if (!injected) {
        return; // Silently return if MetaMask not installed
      }

      // Only check for existing accounts, don't prompt or switch networks
      const accounts = await injected.request({ method: 'eth_accounts' });
      
      if (accounts.length) {
        const web3Provider = new ethers.providers.Web3Provider(injected);
        setProvider(web3Provider);
        setAccount(accounts[0]);
        setupEventListeners();
        await setupContractIfConfigured(web3Provider);
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error);
    }
  };

  const connectWallet = async () => {
    try {
      setIsLoading(true);
      setConnectError("");

      const injected = getInjectedEthereum();
      if (!injected) {
        alert("Please install MetaMask!");
        return;
      }

      const web3Provider = new ethers.providers.Web3Provider(injected);

      // Ensure we are on 31337 before requesting accounts (helps avoid wrong network)
      await ensureHardhatNetwork();

      // Request account access
      const accounts = await injected.request({ method: 'eth_requestAccounts' });

      if (accounts.length) {
        setProvider(web3Provider);
        setAccount(accounts[0]);
        setupEventListeners();
        await setupContractIfConfigured(web3Provider);
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      if (error && error.code === 4001) {
        setConnectError("Request rejected. Please approve the connection in MetaMask.");
      } else if (error && (error.code === -32002 || String(error.message || "").includes("request already pending"))) {
        setConnectError("A connection request is already pending. Open MetaMask and approve it.");
      } else {
        setConnectError("An unexpected error occurred while connecting. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const setupContractIfConfigured = async (web3Provider) => {
    try {
      const envAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
      const storedAddress = (typeof window !== 'undefined') ? window.localStorage.getItem('contractAddress') : null;
      const contractAddress = (envAddress && ethers.utils.isAddress(envAddress))
        ? envAddress
        : (storedAddress && ethers.utils.isAddress(storedAddress))
          ? storedAddress
          : null;

      if (contractAddress) {
        const signer = web3Provider.getSigner();
        const contractInstance = new ethers.Contract(
          contractAddress,
          Upload.abi,
          signer
        );
        setContract(contractInstance);
      } else {
        // No valid contract configured; keep the wallet connected and continue without contract
        setContract(null);
      }
    } catch (error) {
      console.error("Error setting up contract:", error);
      setContract(null);
    }
  };

  const setupEventListeners = () => {
    const injected = getInjectedEthereum();
    if (injected) {
      injected.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          const web3Provider = new ethers.providers.Web3Provider(injected);
          setProvider(web3Provider);
          setupContractIfConfigured(web3Provider);
        } else {
          setAccount("");
          setContract(null);
          setProvider(null);
        }
      });

      injected.on("chainChanged", () => {
        window.location.reload();
      });
    }
  };

  const disconnectWallet = () => {
    setAccount("");
    setContract(null);
    setProvider(null);
  };

  // Check authentication status on component mount
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    const email = localStorage.getItem('userEmail');
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    
    if (token && email && userId) {
      setIsAuthenticated(true);
      setUserInfo({ email, userId, username: username || 'User', token });
      // Don't auto-connect wallet on page load
      // User must manually click "Connect Wallet" button
    }
    
    return () => {
      const injected = getInjectedEthereum();
      if (injected) {
        // Best-effort cleanup (anonymous listeners can't be removed reliably)
      }
    };
  }, []);

  const handleLoginSuccess = (userData) => {
    setIsAuthenticated(true);
    setUserInfo(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    setUserInfo(null);
    disconnectWallet();
  };

  const MainApp = () => (
    <div className="app-wrapper">
      <Navbar 
        account={account}
        onConnect={connectWallet}
        onDisconnect={disconnectWallet}
        isLoading={isLoading}
        connectError={connectError}
        userInfo={userInfo}
        onLogout={handleLogout}
      />

      <div className="App">
        {account ? (
          <>
            {!contract && (
              <div className="contract-setup fade-up" style={{ animationDelay: '100ms' }}>
                <div className="contract-setup-row">
                  <input
                    className="contract-input"
                    type="text"
                    placeholder="Paste contract address (0x...) and click Set"
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                  />
                  <button
                    className="contract-button"
                    onClick={() => {
                      try {
                        const trimmed = (manualAddress || '').trim();
                        if (!ethers.utils.isAddress(trimmed)) return;
                        if (typeof window !== 'undefined') {
                          window.localStorage.setItem('contractAddress', trimmed);
                        }
                        if (provider) {
                          setupContractIfConfigured(provider);
                        }
                      } catch {}
                    }}
                    disabled={!manualAddress || !ethers.utils.isAddress((manualAddress || '').trim())}
                  >
                    Set
                  </button>
                </div>
                <div className="contract-help">If .env wasn't picked up, you can set the address here.</div>
              </div>
            )}
            
            <nav className="app-nav fade-up" style={{ animationDelay: '200ms' }}>
              <button 
                className={`nav-button ${activeTab === 'gallery' ? 'active' : ''}`}
                onClick={() => setActiveTab('gallery')}
              >
                <span className="nav-icon">🖼️</span>
                Gallery
              </button>
              <button 
                className={`nav-button ${activeTab === 'upload' ? 'active' : ''}`}
                onClick={() => setActiveTab('upload')}
              >
                <span className="nav-icon">⬆️</span>
                Upload
              </button>
              <button 
                className="nav-button share-button"
                onClick={() => setModalOpen(true)}
              >
                <span className="nav-icon">🔗</span>
                Share Access
              </button>
            </nav>

            <main className="app-main">
              {activeTab === 'upload' ? (
                <div className="fade-up" style={{ animationDelay: '300ms' }}>
                  <FileUpload
                    account={account}
                    provider={provider}
                    contract={contract}
                    onSuccess={() => setActiveTab('gallery')}
                  />
                </div>
              ) : (
                <div className="fade-up" style={{ animationDelay: '300ms' }}>
                  <Display contract={contract} account={account} />
                </div>
              )}
            </main>
          </>
        ) : (
          <div className="connect-prompt fade-up" style={{ animationDelay: '200ms' }}>
            <div className="prompt-icon">🦊</div>
            <h2>Connect Your Wallet</h2>
            <p>Please connect your MetaMask wallet to access your decentralized drive</p>
          </div>
        )}
      </div>

      <Footer />

      {modalOpen && (
        <Modal setModalOpen={setModalOpen} contract={contract}></Modal>
      )}
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login 
                onLoginSuccess={handleLoginSuccess}
                onSwitchToRegister={() => window.location.href = '/register'}
              />
            )
          } 
        />
        <Route 
          path="/register" 
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Register 
                onRegisterSuccess={handleLoginSuccess}
                onSwitchToLogin={() => window.location.href = '/login'}
              />
            )
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? (
              <MainApp />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/profile" 
          element={
            isAuthenticated ? (
              <div className="app-wrapper">
                <Navbar 
                  account={account}
                  onConnect={connectWallet}
                  onDisconnect={disconnectWallet}
                  isLoading={isLoading}
                  connectError={connectError}
                  userInfo={userInfo}
                  onLogout={handleLogout}
                />
                <Profile userInfo={userInfo} />
                <Footer />
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
        />
      </Routes>
    </Router>
  );
}

export default App;