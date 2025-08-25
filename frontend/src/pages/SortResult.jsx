import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

function SortResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (location.state?.result) {
      setResult(location.state.result);
    } else {
      // If no result data, redirect to dashboard
      navigate('/dashboard');
    }
  }, [location.state, navigate]);

  if (!result) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
        </div>
        <p>Loading results...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>✅ Playlist Sorted Successfully!</h1>
      
      <div className="result">
        <h3>{result.playlistName}</h3>
        <p>Sorted <strong>{result.tracksProcessed}</strong> tracks by release date</p>
        
        {result.oldestTrack && (
          <p>
            <strong>Oldest:</strong> {result.oldestTrack.name} by {result.oldestTrack.artists.join(', ')} 
            <span className="track-date"> ({result.oldestTrack.releaseDate})</span>
          </p>
        )}
        
        {result.newestTrack && (
          <p>
            <strong>Newest:</strong> {result.newestTrack.name} by {result.newestTrack.artists.join(', ')} 
            <span className="track-date"> ({result.newestTrack.releaseDate})</span>
          </p>
        )}
      </div>

      <div className="track-list">
        <h4>Track Order (Oldest to Newest):</h4>
        {result.sortedTracks.map((track, index) => (
          <div key={`${track.name}-${index}`} className="track">
            <div className="track-info">
              <div className="track-name">
                <strong>{index + 1}.</strong> {track.name}
              </div>
              <div className="track-artist">
                by {track.artists.join(', ')}
              </div>
            </div>
            <div className="track-date">
              {track.releaseDate}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '30px' }}>
        <button className="btn" onClick={() => navigate('/dashboard')}>
          Sort Another Playlist
        </button>
        <button 
          className="btn" 
          onClick={() => navigate('/')}
          style={{ marginLeft: '10px', background: '#535353' }}
        >
          Home
        </button>
      </div>
    </div>
  );
}

export default SortResult;
