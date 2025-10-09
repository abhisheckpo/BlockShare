import { useState, useEffect } from "react";
import axios from "axios";
import imageCompression from "browser-image-compression";
import "./FileUpload.css";

const FileUpload = ({ contract, account, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("No image selected");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorText, setErrorText] = useState("");
  const [uploadedCid, setUploadedCid] = useState(null);
  const [networkOk, setNetworkOk] = useState(true);

  // ✅ Warn if MetaMask is not connected to localhost:8545
  useEffect(() => {
    async function checkNetwork() {
      try {
        if (window.ethereum) {
          const chainId = await window.ethereum.request({ method: "eth_chainId" });
          if (chainId !== "0x7a69") {
            // 31337 in hex
            setNetworkOk(false);
          } else {
            setNetworkOk(true);
          }
        }
      } catch (e) {
        console.error("Network check failed:", e);
      }
    }
    checkNetwork();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorText("");
    setUploadedCid(null);

    if (!file) return;
    if (!contract) {
      setErrorText("Smart contract not loaded. Please reconnect wallet.");
      return;
    }

    const jwt = process.env.REACT_APP_PINATA_JWT;
    if (!jwt) {
      setErrorText("Missing REACT_APP_PINATA_JWT in your .env file.");
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      let uploadFile = file;

      // ✅ Compress if image >10 MB
      if (uploadFile.size > 10 * 1024 * 1024 && uploadFile.type.startsWith("image/")) {
        setErrorText("Compressing large image...");
        const compressed = await imageCompression(uploadFile, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1280,
          useWebWorker: true,
        });
        uploadFile = compressed;
        setErrorText("");
      }

      // ✅ Upload to Pinata V3
      const formData = new FormData();
      formData.append("file", uploadFile, uploadFile.name);
      const metadata = JSON.stringify({
        name: uploadFile.name,
        keyvalues: { project: "BlockShare" },
      });
      formData.append("metadata", metadata);

      const resFile = await axios.post("https://uploads.pinata.cloud/v3/files", formData, {
        headers: { Authorization: `Bearer ${jwt}` },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        onUploadProgress: (e) => {
          if (e.total) {
            const percent = Math.round((e.loaded * 100) / e.total);
            setUploadProgress(percent);
          }
        },
      });

      const ipfsHash = resFile?.data?.data?.cid;
      if (!ipfsHash) throw new Error("Pinata response missing cid");

      const ipfsUri = `ipfs://${ipfsHash}`;
      const ipfsGatewayUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

      console.log("📦 Contract address:", contract.address);
      console.log("🧾 Signer address:", await contract.signer.getAddress());
      console.log("🧾 Account prop:", account);

      // ✅ Call smart contract
      try {
        const signerAddr = await contract.signer.getAddress();
        const tx = await contract.add(signerAddr, ipfsUri, { gasLimit: 3000000 });
        await tx.wait();
        console.log("✅ File added to contract:", ipfsUri);
      } catch (err) {
        console.error("❌ Contract transaction failed:", err);
        setErrorText(
          err?.error?.message ||
            err?.message ||
            "Transaction failed. Check Hardhat console for revert reason."
        );
        setIsUploading(false);
        return;
      }

      // ✅ Reset & show preview
      setFile(null);
      setFileName("No image selected");
      setUploadedCid(ipfsGatewayUrl);
      setUploadProgress(100);

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (e) {
      console.error("Upload failed:", e);
      setIsUploading(false);
      setUploadProgress(0);

      if (e.response) {
        const status = e.response.status;
        if (status === 401 || status === 403)
          setErrorText("Pinata authentication failed. Check your Admin JWT.");
        else if (status === 404)
          setErrorText("Pinata endpoint not found. Ensure URL is https://uploads.pinata.cloud/v3/files");
        else if (status === 413)
          setErrorText("File too large. Try compressing or upgrade your Pinata plan.");
        else setErrorText(`Pinata error ${status}: ${e.response.data?.error || "Unknown error"}`);
      } else if (e.message?.includes("Network Error"))
        setErrorText("Network error reaching Pinata. Check CORS or internet connection.");
      else setErrorText(e.message || "Upload failed. Please try again.");
    }
  };

  const retrieveFile = (e) => {
    const data = e.target.files[0];
    if (!data) return;
    setFile(data);
    setFileName(data.name);
  };

  return (
    <div className="upload-container">
      <h2 className="upload-title">Upload New Image</h2>
      <p className="upload-description">
        Share your images securely using IPFS and blockchain technology
      </p>

      {!networkOk && (
        <div className="upload-error">
          ⚠️ Please switch MetaMask to <b>Localhost 8545 (Chain ID: 31337)</b>.
        </div>
      )}

      <form className="form" onSubmit={handleSubmit}>
        <div className="upload-area">
          <label htmlFor="file-upload" className="choose">
            <span className="choose-icon">📁</span> Choose Image
          </label>
          <input type="file" id="file-upload" name="data" onChange={retrieveFile} accept="image/*" />
          <span className="textArea">{file ? fileName : "No file selected"}</span>
        </div>

        {isUploading && (
          <div className="upload-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        )}

        <button type="submit" className="upload" disabled={!file || isUploading}>
          {isUploading ? `Uploading... ${uploadProgress}%` : "Upload File"}
        </button>

        {errorText && <div className="upload-error">{errorText}</div>}
      </form>

      {uploadedCid && (
        <div className="upload-preview">
          <h3>✅ Uploaded Image Preview:</h3>
          <a href={uploadedCid} target="_blank" rel="noopener noreferrer">
            <img src={uploadedCid} alt="Uploaded" className="preview-img" />
          </a>
          <p>
            IPFS CID:{" "}
            <code>{uploadedCid.replace("https://gateway.pinata.cloud/ipfs/", "")}</code>
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
