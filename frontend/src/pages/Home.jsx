import { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';

function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleConnect = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const authData = await apiClient.getAuthUrl();
      
      // Redirect to Spotify auth (this will redirect back to /callback which handles auth)
      window.location.href = authData.authUrl;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const authStatus = await apiClient.checkAuthStatus();
        if (authStatus.authenticated) {
          window.location.href = '/dashboard';
        }
      } catch (err) {
        // User not authenticated, stay on home page
      }
    };
    
    checkAuth();
  }, []);

  return (
    <div className="container">
      <h1>🎵 Spotify Playlist Sorter</h1>
      
      <div className="info">
        <p>This application will help you sort your Spotify playlists by release date.</p>
        <p>Click the button below to authenticate with Spotify and get started!</p>
      </div>

      {error && (
        <div className="error">
          <p>{error}</p>
        </div>
      )}

      <button 
        className="btn" 
        onClick={handleConnect}
        disabled={loading}
      >
        {loading ? 'Connecting...' : 'Connect to Spotify'}
      </button>

      <div style={{ marginTop: '40px', fontSize: '14px', color: '#b3b3b3' }}>
        <p>This app requires the following Spotify permissions:</p>
        <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
          <li>View your playlists</li>
          <li>Modify your playlists</li>
          <li>Access your profile information</li>
        </ul>
      </div>
    </div>
  );
}

export default Home;
