require('dotenv').config();
const express = require('express');
const SpotifyService = require('./services/spotifyService');
const PlaylistSorter = require('./services/playlistSorter');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(express.static('public'));

// Initialize services
const spotifyService = new SpotifyService();
const playlistSorter = new PlaylistSorter(spotifyService);

// Routes
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Spotify Playlist Sorter</title>
                <style>
                    body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
                    .container { text-align: center; }
                    .btn { background: #1db954; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-size: 16px; }
                    .btn:hover { background: #1ed760; }
                    .info { background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🎵 Spotify Playlist Sorter</h1>
                    <div class="info">
                        <p>This application will help you sort your Spotify playlists by release date.</p>
                        <p>Click the button below to authenticate with Spotify and get started!</p>
                    </div>
                    <a href="/auth" class="btn">Connect to Spotify</a>
                </div>
            </body>
        </html>
    `);
});

// Authentication routes
app.get('/auth', (req, res) => {
    const authURL = spotifyService.getAuthURL();
    res.redirect(authURL);
});

app.get('/callback', async (req, res) => {
    try {
        const { code } = req.query;
        await spotifyService.handleCallback(code);
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).send('Authentication failed. Please try again.');
    }
});

// Dashboard route
app.get('/dashboard', async (req, res) => {
    try {
        if (!spotifyService.isAuthenticated()) {
            return res.redirect('/auth');
        }

        const playlists = await spotifyService.getUserPlaylists();
        
        let playlistOptions = playlists.map(playlist => 
            `<option value="${playlist.id}">${playlist.name} (${playlist.tracks.total} tracks)</option>`
        ).join('');

        res.send(`
            <html>
                <head>
                    <title>Spotify Playlist Sorter - Dashboard</title>
                    <style>
                        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
                        .container { text-align: center; }
                        .form-group { margin: 20px 0; }
                        select, button { padding: 10px; font-size: 16px; }
                        select { width: 300px; }
                        .btn { background: #1db954; color: white; padding: 15px 30px; border: none; border-radius: 25px; cursor: pointer; }
                        .btn:hover { background: #1ed760; }
                        .result { background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: left; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>🎵 Select a Playlist to Sort</h1>
                        <form action="/sort" method="post">
                            <div class="form-group">
                                <label for="playlist">Choose a playlist:</label><br><br>
                                <select name="playlistId" id="playlist" required>
                                    <option value="">Select a playlist...</option>
                                    ${playlistOptions}
                                </select>
                            </div>
                            <div class="form-group">
                                <button type="submit" class="btn">Sort by Release Date</button>
                            </div>
                        </form>
                        <p><a href="/auth">Re-authenticate</a> | <a href="/">Home</a></p>
                    </div>
                </body>
            </html>
        `);
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).send('Error loading dashboard. Please try again.');
    }
});

// Sort playlist route
app.post('/sort', async (req, res) => {
    try {
        const { playlistId } = req.body;
        
        if (!playlistId) {
            return res.status(400).send('Please select a playlist.');
        }

        const result = await playlistSorter.sortPlaylistByReleaseDate(playlistId);
        
        res.send(`
            <html>
                <head>
                    <title>Sorting Complete</title>
                    <style>
                        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
                        .container { text-align: center; }
                        .result { background: #d4edda; padding: 20px; border-radius: 10px; margin: 20px 0; }
                        .track-list { text-align: left; max-height: 400px; overflow-y: auto; background: white; padding: 15px; border-radius: 5px; }
                        .track { margin: 10px 0; padding: 10px; border-bottom: 1px solid #eee; }
                        .btn { background: #1db954; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>✅ Playlist Sorted Successfully!</h1>
                        <div class="result">
                            <h3>${result.playlistName}</h3>
                            <p>Sorted ${result.tracksProcessed} tracks by release date</p>
                            <p>Oldest: ${result.oldestTrack?.name} (${result.oldestTrack?.releaseDate})</p>
                            <p>Newest: ${result.newestTrack?.name} (${result.newestTrack?.releaseDate})</p>
                        </div>
                        <div class="track-list">
                            <h4>Track Order (Oldest to Newest):</h4>
                            ${result.sortedTracks.map((track, index) => `
                                <div class="track">
                                    <strong>${index + 1}.</strong> ${track.name} by ${track.artists.join(', ')} 
                                    <span style="color: #666;">(${track.releaseDate})</span>
                                </div>
                            `).join('')}
                        </div>
                        <p><a href="/dashboard" class="btn">Sort Another Playlist</a></p>
                    </div>
                </body>
            </html>
        `);
    } catch (error) {
        console.error('Sort error:', error);
        res.status(500).send(`
            <div style="text-align: center; padding: 50px;">
                <h2>Error Sorting Playlist</h2>
                <p>${error.message}</p>
                <a href="/dashboard">Try Again</a>
            </div>
        `);
    }
});

app.listen(PORT, () => {
    console.log(`🎵 Spotify Playlist Sorter running on http://localhost:${PORT}`);
    console.log('Make sure to set up your .env file with Spotify API credentials!');
});

module.exports = app;
