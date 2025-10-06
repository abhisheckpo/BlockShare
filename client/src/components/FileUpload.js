import { useState } from "react";
import axios from "axios";
import "./FileUpload.css";

const FileUpload = ({ contract, account, provider, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("No image selected");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [errorText, setErrorText] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorText("");
    if (!file) return;

    // Build Pinata auth headers: prefer JWT, else key+secret
    const jwt = process.env.REACT_APP_PINATA_JWT;
    const apiKey = process.env.REACT_APP_PINATA_API_KEY;
    const apiSecret = process.env.REACT_APP_PINATA_SECRET_KEY;

    if (!jwt && (!apiKey || !apiSecret)) {
      setErrorText("Pinata credentials are missing. Add REACT_APP_PINATA_JWT or both REACT_APP_PINATA_API_KEY and REACT_APP_PINATA_SECRET_KEY in client/.env, then restart.");
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append("file", file);

      const headers = jwt
        ? { Authorization: `Bearer ${jwt}` }
        : {
            pinata_api_key: apiKey,
            pinata_secret_api_key: apiSecret,
          };

      const resFile = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
        data: formData,
        headers: {
          ...headers,
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        },
      });

      const ipfsHash = resFile?.data?.IpfsHash;
      if (!ipfsHash) {
        throw new Error("Pinata response missing IpfsHash");
      }

      // Store ipfs:// URI to match gallery expectations
      const ipfsUri = `ipfs://${ipfsHash}`;

      try {
        if (!contract) {
          throw new Error("Contract not configured. Set REACT_APP_CONTRACT_ADDRESS and reconnect wallet.");
        }
        await contract.add(account, ipfsUri);
      } catch (contractErr) {
        console.error("Contract save failed:", contractErr);
        setErrorText("Upload succeeded, but saving to contract failed. Check contract address/permissions.");
        setIsUploading(false);
        setUploadProgress(0);
        return;
      }

      setFileName("No image selected");
      setFile(null);
      setUploadProgress(100);

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        if (onSuccess) onSuccess();
      }, 1200);
    } catch (e) {
      console.error("Upload failed:", e);
      setIsUploading(false);
      setUploadProgress(0);
      if (e.response) {
        const status = e.response.status;
        if (status === 401 || status === 403) {
          setErrorText("Pinata authentication failed. Verify your API key/secret or JWT.");
        } else if (status === 429) {
          setErrorText("Rate limited by Pinata. Please wait and try again.");
        } else {
          setErrorText(`Pinata error ${status}: ${e.response.data?.error || 'Check credentials and CORS.'}`);
        }
      } else if (e.message?.includes('Network Error')) {
        setErrorText("Network error reaching Pinata. Check your internet and CORS settings.");
      } else {
        setErrorText("Failed to upload. Please check your API keys and try again.");
      }
    }
  };

  const retrieveFile = (e) => {
    e.preventDefault();
    const data = e.target.files[0];
    if (!data) return;

    const reader = new window.FileReader();
    reader.readAsArrayBuffer(data);
    reader.onloadend = () => {
      setFile(data);
      setFileName(data.name);
    };
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const data = e.dataTransfer.files[0];
      const reader = new window.FileReader();
      reader.readAsArrayBuffer(data);
      reader.onloadend = () => {
        setFile(data);
        setFileName(data.name);
      };
    }
  };

  return (
    <div className="upload-container scale-in">
      <h2 className="upload-title">Upload New Image</h2>
      <p className="upload-description">
        Share your images securely using IPFS and blockchain technology
      </p>
      
      <form 
        className={`form ${dragActive ? 'drag-active' : ''}`} 
        onSubmit={handleSubmit}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="upload-area">
          <label htmlFor="file-upload" className="choose">
            <span className="choose-icon">📁</span>
            Choose Image
          </label>
          <input
            disabled={!account}
            type="file"
            id="file-upload"
            name="data"
            onChange={retrieveFile}
            accept="image/*"
          />
          <span className={`textArea ${file ? 'has-file' : ''}`}>
            {file ? (
              <>
                <span className="file-icon">🖼️</span>
                {fileName}
              </>
            ) : (
              <>
                <span className="upload-icon">⬆️</span>
                Drag and drop or click to upload
              </>
            )}
          </span>
        </div>

        {file && (
          <div className="upload-progress">
            {isUploading && (
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>
        )}

        <button 
          type="submit" 
          className={`upload ${isUploading ? 'uploading' : ''}`} 
          disabled={!file || isUploading || !account || !contract}
        >
          {!account ? (
            'Please connect your wallet'
          ) : !contract ? (
            'Contract not configured'
          ) : isUploading ? (
            <span className="upload-status">
              {uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : 'Success!'}
            </span>
          ) : (
            'Upload File'
          )}
        </button>
        {errorText && (
          <div className="upload-error">{errorText}</div>
        )}
      </form>
    </div>
  );
};

export default FileUpload;