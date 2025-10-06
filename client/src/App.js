import Upload from "./artifacts/contracts/Upload.sol/Upload.json";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import FileUpload from "./components/FileUpload";
import Display from "./components/Display";
import Modal from "./components/Modal";
import "./App.css";

function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('gallery');
  const [connectError, setConnectError] = useState("");

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

  const checkIfWalletIsConnected = async () => {
    try {
      const injected = getInjectedEthereum();
      if (!injected) {
        alert("Please install MetaMask!");
        return;
      }

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
      const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
      if (contractAddress && ethers.utils.isAddress(contractAddress)) {
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

  // Check if wallet is connected on component mount
  useEffect(() => {
    checkIfWalletIsConnected();
    return () => {
      const injected = getInjectedEthereum();
      if (injected) {
        // Best-effort cleanup (anonymous listeners can't be removed reliably)
      }
    };
  }, []);

  return (
    <div className="app-wrapper">
      <div className="App">
        <div className="bg"></div>
        <div className="bg bg2"></div>
        <div className="bg bg3"></div>

        <header className="app-header fade-up" style={{ animationDelay: '200ms' }}>
          <h1>Gdrive 3.0</h1>
          
          {account ? (
            <div className="wallet-info">
              <div className="account-info">
                <span className="address-label">Connected:</span>
                <span className="address">{`${account.slice(0, 6)}...${account.slice(-4)}`}</span>
              </div>
              <button className="wallet-button disconnect" onClick={disconnectWallet}>
                Disconnect
              </button>
            </div>
          ) : (
            <button 
              className={`wallet-button connect ${isLoading ? 'loading' : ''}`} 
              onClick={connectWallet}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading-text">Connecting...</span>
              ) : (
                <>
                  <span className="wallet-icon">🦊</span>
                  Connect MetaMask
                </>
              )}
            </button>
          )}
          {!account && connectError && (
            <div className="connect-error">{connectError}</div>
          )}
        </header>

        {account ? (
          <>
            <nav className="app-nav fade-up" style={{ animationDelay: '300ms' }}>
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
                <div className="fade-up" style={{ animationDelay: '400ms' }}>
                  <FileUpload
                    account={account}
                    provider={provider}
                    contract={contract}
                    onSuccess={() => setActiveTab('gallery')}
                  />
                </div>
              ) : (
                <div className="fade-up" style={{ animationDelay: '400ms' }}>
                  <Display contract={contract} account={account} />
                </div>
              )}
            </main>
          </>
        ) : (
          <div className="connect-prompt fade-up" style={{ animationDelay: '300ms' }}>
            <div className="prompt-icon">🦊</div>
            <h2>Connect Your Wallet</h2>
            <p>Please connect your MetaMask wallet to access your decentralized drive</p>
          </div>
        )}
      </div>

      {modalOpen && (
        <Modal setModalOpen={setModalOpen} contract={contract}></Modal>
      )}
    </div>
  );
}

export default App;