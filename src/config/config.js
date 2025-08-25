/**
 * Application configuration
 */

module.exports = {
    // Server configuration
    server: {
        port: process.env.PORT || 3000,
        host: process.env.HOST || 'localhost'
    },

    // Spotify API configuration
    spotify: {
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        redirectUri: process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3000/callback',
        scopes: [
            'user-read-private',
            'user-read-email',
            'playlist-read-private',
            'playlist-read-collaborative',
            'playlist-modify-private',
            'playlist-modify-public'
        ]
    },

    // Application settings
    app: {
        name: 'Spotify Playlist Sorter',
        version: '1.0.0',
        description: 'Sort your Spotify playlists by release date'
    },

    // API limits and settings
    api: {
        playlistLimit: 50,          // Max playlists to fetch at once
        trackBatchSize: 100,        // Max tracks per API request
        maxRetries: 3,              // Max retry attempts for failed requests
        retryDelay: 1000           // Delay between retries (ms)
    },

    // Validation
    validate() {
        const required = [
            'SPOTIFY_CLIENT_ID',
            'SPOTIFY_CLIENT_SECRET'
        ];

        const missing = required.filter(key => !process.env[key]);
        
        if (missing.length > 0) {
            throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        }

        return true;
    }
};
