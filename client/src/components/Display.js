import { useState } from "react";
import "./Display.css";

const Display = ({ contract, account }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadedImages, setLoadedImages] = useState({});

  const getdata = async () => {
    const address = document.querySelector(".address").value;
    setLoading(true);
    setError(null);
    setData([]);
    
    try {
      const dataArray = await contract.display(address || account);
    const isEmpty = Object.keys(dataArray).length === 0;

    if (!isEmpty) {
      const str = dataArray.toString();
      const str_array = str.split(",");
        const images = str_array.map((item, i) => ({
          id: i,
          url: item,
          src: `https://gateway.pinata.cloud/ipfs/${item.substring(6)}`,
        }));
      setData(images);
    } else {
        setError("No images found");
      }
    } catch (e) {
      console.error("Failed to fetch images:", e);
      setError("You don't have access to these images");
    } finally {
      setLoading(false);
    }
  };

  const handleImageLoad = (imageId) => {
    setLoadedImages(prev => ({
      ...prev,
      [imageId]: true
    }));
  };

  const handleImageError = (imageId) => {
    setLoadedImages(prev => ({
      ...prev,
      [imageId]: 'error'
    }));
  };

  return (
    <div className="display-container scale-in">
      <div className="search-bar">
      <input
        type="text"
        placeholder="Enter Address"
        className="address"
        />
        <button 
          className={`button ${loading ? 'loading' : ''}`} 
          onClick={getdata}
          disabled={loading}
        >
          {loading ? (
            <span className="loading-text">Loading...</span>
          ) : (
            <>
              <span className="button-icon">🔍</span>
              Get Images
            </>
          )}
      </button>
      </div>

      {error && (
        <div className="error-message fade-up">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="image-grid">
        {data.map((image, index) => (
          <div 
            key={image.id}
            className={`image-card fade-up ${loadedImages[image.id] === true ? 'loaded' : ''}`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <a 
              href={image.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="image-link"
            >
              {!loadedImages[image.id] && (
                <div className="image-placeholder pulse">
                  <span className="loading-icon">🖼️</span>
                </div>
              )}
              <img
                src={image.src}
                alt={`Image ${image.id + 1}`}
                className={`gallery-image ${loadedImages[image.id] === true ? 'loaded' : ''}`}
                onLoad={() => handleImageLoad(image.id)}
                onError={() => handleImageError(image.id)}
              />
              {loadedImages[image.id] === 'error' && (
                <div className="image-error">
                  <span className="error-icon">⚠️</span>
                  Failed to load image
                </div>
              )}
            </a>
          </div>
        ))}
      </div>

      {data.length === 0 && !loading && !error && (
        <div className="empty-state fade-up">
          <span className="empty-icon">📁</span>
          <p>No images to display. Enter an address to view shared images.</p>
        </div>
      )}
    </div>
  );
};

export default Display;
