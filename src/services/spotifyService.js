const SpotifyWebApi = require('spotify-web-api-node');

class SpotifyService {
    constructor() {
        this.spotifyApi = new SpotifyWebApi({
            clientId: process.env.SPOTIFY_CLIENT_ID,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
            redirectUri: process.env.SPOTIFY_REDIRECT_URI
        });

        this.scopes = [
            'user-read-private',
            'user-read-email',
            'playlist-read-private',
            'playlist-read-collaborative',
            'playlist-modify-private',
            'playlist-modify-public'
        ];
    }

    /**
     * Generate Spotify authorization URL
     */
    getAuthURL() {
        return this.spotifyApi.createAuthorizeURL(this.scopes, 'state');
    }

    /**
     * Handle the callback from Spotify authorization
     */
    async handleCallback(code) {
        try {
            const data = await this.spotifyApi.authorizationCodeGrant(code);
            
            // Set the access token and refresh token
            this.spotifyApi.setAccessToken(data.body.access_token);
            this.spotifyApi.setRefreshToken(data.body.refresh_token);
            
            console.log('Successfully authenticated with Spotify!');
            console.log('Access token expires in:', data.body.expires_in, 'seconds');
            
            return data.body;
        } catch (error) {
            console.error('Error during authentication:', error);
            throw new Error('Failed to authenticate with Spotify');
        }
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!this.spotifyApi.getAccessToken();
    }

    /**
     * Refresh access token if needed
     */
    async refreshAccessToken() {
        try {
            const data = await this.spotifyApi.refreshAccessToken();
            this.spotifyApi.setAccessToken(data.body.access_token);
            console.log('Access token refreshed successfully');
            return data.body.access_token;
        } catch (error) {
            console.error('Error refreshing access token:', error);
            throw new Error('Failed to refresh access token');
        }
    }

    /**
     * Get current user's profile
     */
    async getUserProfile() {
        try {
            const data = await this.spotifyApi.getMe();
            return data.body;
        } catch (error) {
            if (error.statusCode === 401) {
                await this.refreshAccessToken();
                return this.getUserProfile();
            }
            console.error('Error getting user profile:', error);
            throw new Error('Failed to get user profile');
        }
    }

    /**
     * Get user's playlists
     */
    async getUserPlaylists(limit = 50) {
        try {
            const data = await this.spotifyApi.getUserPlaylists({ limit });
            return data.body.items;
        } catch (error) {
            if (error.statusCode === 401) {
                await this.refreshAccessToken();
                return this.getUserPlaylists(limit);
            }
            console.error('Error getting user playlists:', error);
            throw new Error('Failed to get user playlists');
        }
    }

    /**
     * Get playlist details
     */
    async getPlaylist(playlistId) {
        try {
            const data = await this.spotifyApi.getPlaylist(playlistId);
            return data.body;
        } catch (error) {
            if (error.statusCode === 401) {
                await this.refreshAccessToken();
                return this.getPlaylist(playlistId);
            }
            console.error('Error getting playlist:', error);
            throw new Error('Failed to get playlist details');
        }
    }

    /**
     * Get all tracks from a playlist (handles pagination)
     */
    async getPlaylistTracks(playlistId) {
        try {
            let allTracks = [];
            let offset = 0;
            const limit = 100;
            let hasMore = true;

            while (hasMore) {
                const data = await this.spotifyApi.getPlaylistTracks(playlistId, {
                    offset,
                    limit,
                    fields: 'items(track(id,name,artists,album(name,release_date,release_date_precision))),next'
                });

                const tracks = data.body.items
                    .filter(item => item.track && item.track.id) // Filter out null tracks
                    .map(item => ({
                        id: item.track.id,
                        name: item.track.name,
                        artists: item.track.artists.map(artist => artist.name),
                        album: {
                            name: item.track.album.name,
                            releaseDate: item.track.album.release_date,
                            releaseDatePrecision: item.track.album.release_date_precision
                        }
                    }));

                allTracks = allTracks.concat(tracks);
                
                hasMore = data.body.next !== null;
                offset += limit;
            }

            return allTracks;
        } catch (error) {
            if (error.statusCode === 401) {
                await this.refreshAccessToken();
                return this.getPlaylistTracks(playlistId);
            }
            console.error('Error getting playlist tracks:', error);
            throw new Error('Failed to get playlist tracks');
        }
    }

    /**
     * Update playlist track order
     */
    async reorderPlaylistTracks(playlistId, trackUris) {
        try {
            // Clear the playlist first
            await this.spotifyApi.replaceTracksInPlaylist(playlistId, []);
            
            // Add tracks in the new order (Spotify API has a limit of 100 tracks per request)
            const batchSize = 100;
            for (let i = 0; i < trackUris.length; i += batchSize) {
                const batch = trackUris.slice(i, i + batchSize);
                if (i === 0) {
                    // Replace for first batch
                    await this.spotifyApi.replaceTracksInPlaylist(playlistId, batch);
                } else {
                    // Add for subsequent batches
                    await this.spotifyApi.addTracksToPlaylist(playlistId, batch);
                }
            }

            console.log(`Successfully reordered playlist with ${trackUris.length} tracks`);
            return true;
        } catch (error) {
            if (error.statusCode === 401) {
                await this.refreshAccessToken();
                return this.reorderPlaylistTracks(playlistId, trackUris);
            }
            console.error('Error reordering playlist tracks:', error);
            throw new Error('Failed to reorder playlist tracks');
        }
    }

    /**
     * Get track details by IDs
     */
    async getTracks(trackIds) {
        try {
            // Spotify API allows max 50 tracks per request
            const batchSize = 50;
            let allTracks = [];

            for (let i = 0; i < trackIds.length; i += batchSize) {
                const batch = trackIds.slice(i, i + batchSize);
                const data = await this.spotifyApi.getTracks(batch);
                allTracks = allTracks.concat(data.body.tracks);
            }

            return allTracks;
        } catch (error) {
            if (error.statusCode === 401) {
                await this.refreshAccessToken();
                return this.getTracks(trackIds);
            }
            console.error('Error getting tracks:', error);
            throw new Error('Failed to get track details');
        }
    }
}

module.exports = SpotifyService;
