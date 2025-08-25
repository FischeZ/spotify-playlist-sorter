import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';

function Dashboard() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check auth status first
        const authStatus = await apiClient.checkAuthStatus();
        if (!authStatus.authenticated) {
          navigate('/');
          return;
        }

        const playlistData = await apiClient.getPlaylists();
        setPlaylists(playlistData);
      } catch (err) {
        setError(err.message);
        if (err.message.includes('authentication') || err.message.includes('unauthorized')) {
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, [navigate]);

  const handleSort = async (e) => {
    e.preventDefault();
    
    if (!selectedPlaylist) {
      setError('Please select a playlist to sort');
      return;
    }

    try {
      setSorting(true);
      setError(null);
      
      const result = await apiClient.sortPlaylist(selectedPlaylist);
      
      // Navigate to results page with the result data
      navigate('/sort-result', { state: { result } });
    } catch (err) {
      setError(err.message);
    } finally {
      setSorting(false);
    }
  };

  const handleReauth = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
        </div>
        <p>Loading your playlists...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>🎵 Select a Playlist to Sort</h1>

      {error && (
        <div className="error">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSort}>
        <div className="form-group">
          <label htmlFor="playlist">Choose a playlist:</label>
          <select
            name="playlistId"
            id="playlist"
            value={selectedPlaylist}
            onChange={(e) => setSelectedPlaylist(e.target.value)}
            required
          >
            <option value="">Select a playlist...</option>
            {playlists.map((playlist) => (
              <option key={playlist.id} value={playlist.id}>
                {playlist.name} ({playlist.tracks.total} tracks)
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <button 
            type="submit" 
            className="btn"
            disabled={sorting || !selectedPlaylist}
          >
            {sorting ? 'Sorting...' : 'Sort by Release Date'}
          </button>
        </div>
      </form>

      {sorting && (
        <div className="info">
          <p>🔄 Sorting your playlist...</p>
          <p>This may take a few moments depending on the number of tracks.</p>
        </div>
      )}

      <div style={{ marginTop: '40px' }}>
        <button className="btn" onClick={handleReauth} style={{ marginRight: '10px' }}>
          Re-authenticate
        </button>
        <button className="btn" onClick={() => navigate('/')}>
          Home
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
