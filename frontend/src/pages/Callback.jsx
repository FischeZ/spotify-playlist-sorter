import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../services/apiClient';

function Callback() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const errorParam = searchParams.get('error');

        if (errorParam) {
          let errorMessage = 'Authentication failed';
          
          switch (errorParam) {
            case 'access_denied':
              errorMessage = 'Authentication was denied. Please try again and grant the necessary permissions.';
              break;
            case 'authentication_failed':
              errorMessage = 'Authentication failed. Please try again.';
              break;
            case 'no_code_received':
              errorMessage = 'No authorization code received from Spotify.';
              break;
            default:
              errorMessage = `Authentication error: ${errorParam}`;
          }
          
          throw new Error(errorMessage);
        }

        // If we reach here without an error, the backend should have handled auth
        // and redirected us to dashboard. If we're still on callback page, something went wrong.
        throw new Error('Authentication process incomplete. Please try again.');
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
        </div>
        <h2>Completing authentication...</h2>
        <p>Please wait while we connect your Spotify account.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="error">
        <h2>Authentication Failed</h2>
        <p>{error}</p>
      </div>
      
      <button className="btn" onClick={() => navigate('/')}>
        Try Again
      </button>
    </div>
  );
}

export default Callback;
