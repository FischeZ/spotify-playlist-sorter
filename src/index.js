require('dotenv').config();
const express = require('express');
const cors = require('cors');
const SpotifyService = require('./services/spotifyService');
const PlaylistSorter = require('./services/playlistSorter');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize services
const spotifyService = new SpotifyService();
const playlistSorter = new PlaylistSorter(spotifyService);

// API Routes
app.get('/api/auth-url', (req, res) => {
    try {
        const authURL = spotifyService.getAuthURL();
        res.json({ authUrl: authURL });
    } catch (error) {
        console.error('Error generating auth URL:', error);
        res.status(500).json({ error: 'Failed to generate auth URL' });
    }
});

// Note: OAuth callback is now handled directly in GET /callback route above

app.get('/api/auth-status', (req, res) => {
    try {
        const authenticated = spotifyService.isAuthenticated();
        res.json({ authenticated });
    } catch (error) {
        console.error('Error checking auth status:', error);
        res.json({ authenticated: false });
    }
});

// Spotify OAuth callback route - handle authentication directly
app.get('/callback', async (req, res) => {
    const { code, error } = req.query;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    if (error) {
        console.error('Spotify OAuth error:', error);
        res.redirect(`${frontendUrl}/callback?error=${encodeURIComponent(error)}`);
        return;
    }
    
    if (!code) {
        console.error('No authorization code received');
        res.redirect(`${frontendUrl}/callback?error=no_code_received`);
        return;
    }

    try {
        // Handle authentication directly here
        await spotifyService.handleCallback(code);
        console.log('Authentication successful, redirecting to dashboard');
        res.redirect(`${frontendUrl}/dashboard`);
    } catch (authError) {
        console.error('Authentication failed:', authError.message);
        res.redirect(`${frontendUrl}/callback?error=${encodeURIComponent('authentication_failed')}`);
    }
});

app.get('/api/playlists', async (req, res) => {
    try {
        if (!spotifyService.isAuthenticated()) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const playlists = await spotifyService.getUserPlaylists();
        res.json(playlists);
    } catch (error) {
        console.error('Error fetching playlists:', error);
        res.status(500).json({ error: 'Failed to fetch playlists' });
    }
});

app.post('/api/sort', async (req, res) => {
    try {
        const { playlistId } = req.body;
        
        if (!playlistId) {
            return res.status(400).json({ error: 'Please select a playlist.' });
        }

        if (!spotifyService.isAuthenticated()) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const result = await playlistSorter.sortPlaylistByReleaseDate(playlistId);
        res.json(result);
    } catch (error) {
        console.error('Sort error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/playlist/:playlistId/stats', async (req, res) => {
    try {
        const { playlistId } = req.params;
        
        if (!spotifyService.isAuthenticated()) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const stats = await playlistSorter.getPlaylistStatistics(playlistId);
        res.json(stats);
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🎵 Spotify Playlist Sorter running on http://localhost:${PORT}`);
    console.log('Make sure to set up your .env file with Spotify API credentials!');
});

module.exports = app;
