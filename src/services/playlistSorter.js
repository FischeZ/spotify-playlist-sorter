class PlaylistSorter {
    constructor(spotifyService) {
        this.spotifyService = spotifyService;
    }

    /**
     * Sort a playlist by release date (oldest to newest)
     */
    async sortPlaylistByReleaseDate(playlistId) {
        try {
            console.log(`Starting to sort playlist: ${playlistId}`);
            
            // Get playlist details
            const playlist = await this.spotifyService.getPlaylist(playlistId);
            console.log(`Processing playlist: ${playlist.name} with ${playlist.tracks.total} tracks`);

            // Get all tracks from the playlist
            const tracks = await this.spotifyService.getPlaylistTracks(playlistId);
            console.log(`Retrieved ${tracks.length} tracks from playlist`);

            if (tracks.length === 0) {
                throw new Error('Playlist is empty or contains no valid tracks');
            }

            // Sort tracks by release date
            const sortedTracks = this.sortTracksByReleaseDate(tracks);
            console.log('Tracks sorted by release date');

            // Create array of track URIs in sorted order
            const sortedTrackUris = sortedTracks.map(track => `spotify:track:${track.id}`);

            // Update the playlist with the new order
            await this.spotifyService.reorderPlaylistTracks(playlistId, sortedTrackUris);
            console.log('Playlist reordered successfully');

            // Prepare result summary
            const result = {
                playlistName: playlist.name,
                tracksProcessed: sortedTracks.length,
                sortedTracks: sortedTracks.map(track => ({
                    name: track.name,
                    artists: track.artists,
                    releaseDate: this.formatReleaseDate(track.album.releaseDate, track.album.releaseDatePrecision),
                    album: track.album.name
                })),
                oldestTrack: sortedTracks.length > 0 ? {
                    name: sortedTracks[0].name,
                    artists: sortedTracks[0].artists,
                    releaseDate: this.formatReleaseDate(sortedTracks[0].album.releaseDate, sortedTracks[0].album.releaseDatePrecision)
                } : null,
                newestTrack: sortedTracks.length > 0 ? {
                    name: sortedTracks[sortedTracks.length - 1].name,
                    artists: sortedTracks[sortedTracks.length - 1].artists,
                    releaseDate: this.formatReleaseDate(sortedTracks[sortedTracks.length - 1].album.releaseDate, sortedTracks[sortedTracks.length - 1].album.releaseDatePrecision)
                } : null
            };

            return result;
        } catch (error) {
            console.error('Error sorting playlist:', error);
            throw error;
        }
    }

    /**
     * Sort tracks by release date (oldest to newest)
     */
    sortTracksByReleaseDate(tracks) {
        return tracks.sort((a, b) => {
            const dateA = this.parseReleaseDate(a.album.releaseDate, a.album.releaseDatePrecision);
            const dateB = this.parseReleaseDate(b.album.releaseDate, b.album.releaseDatePrecision);
            
            return dateA - dateB;
        });
    }

    /**
     * Parse release date string into a Date object
     * Handles different precision levels (year, month, day)
     */
    parseReleaseDate(releaseDateString, precision) {
        if (!releaseDateString) {
            // If no release date, put at the end
            return new Date('9999-12-31');
        }

        switch (precision) {
            case 'year':
                // Format: "2023"
                return new Date(`${releaseDateString}-01-01`);
            
            case 'month':
                // Format: "2023-03"
                return new Date(`${releaseDateString}-01`);
            
            case 'day':
            default:
                // Format: "2023-03-15"
                return new Date(releaseDateString);
        }
    }

    /**
     * Format release date for display
     */
    formatReleaseDate(releaseDateString, precision) {
        if (!releaseDateString) {
            return 'Unknown';
        }

        const date = this.parseReleaseDate(releaseDateString, precision);
        
        switch (precision) {
            case 'year':
                return date.getFullYear().toString();
            
            case 'month':
                return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
            
            case 'day':
            default:
                return date.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
        }
    }

    /**
     * Sort playlist by release date (newest to oldest)
     */
    async sortPlaylistByReleaseDateDescending(playlistId) {
        try {
            const result = await this.sortPlaylistByReleaseDate(playlistId);
            
            // Reverse the order for newest to oldest
            const reversedTrackUris = result.sortedTracks
                .reverse()
                .map(track => `spotify:track:${track.id}`);
            
            // Update the playlist with the reversed order
            await this.spotifyService.reorderPlaylistTracks(playlistId, reversedTrackUris);
            
            // Update result to reflect the new order
            result.sortedTracks.reverse();
            const temp = result.oldestTrack;
            result.oldestTrack = result.newestTrack;
            result.newestTrack = temp;
            
            return result;
        } catch (error) {
            console.error('Error sorting playlist (descending):', error);
            throw error;
        }
    }

    /**
     * Get playlist statistics (release date range, decade distribution, etc.)
     */
    async getPlaylistStatistics(playlistId) {
        try {
            const tracks = await this.spotifyService.getPlaylistTracks(playlistId);
            
            if (tracks.length === 0) {
                return { error: 'Playlist is empty' };
            }

            const releaseDates = tracks
                .map(track => this.parseReleaseDate(track.album.releaseDate, track.album.releaseDatePrecision))
                .filter(date => date.getFullYear() !== 9999); // Filter out unknown dates

            if (releaseDates.length === 0) {
                return { error: 'No valid release dates found' };
            }

            const sortedDates = releaseDates.sort((a, b) => a - b);
            const oldestDate = sortedDates[0];
            const newestDate = sortedDates[sortedDates.length - 1];

            // Calculate decade distribution
            const decadeCount = {};
            releaseDates.forEach(date => {
                const decade = Math.floor(date.getFullYear() / 10) * 10;
                decadeCount[decade] = (decadeCount[decade] || 0) + 1;
            });

            // Calculate year distribution
            const yearCount = {};
            releaseDates.forEach(date => {
                const year = date.getFullYear();
                yearCount[year] = (yearCount[year] || 0) + 1;
            });

            return {
                totalTracks: tracks.length,
                tracksWithDates: releaseDates.length,
                dateRange: {
                    oldest: oldestDate.toLocaleDateString(),
                    newest: newestDate.toLocaleDateString(),
                    spanYears: newestDate.getFullYear() - oldestDate.getFullYear()
                },
                decadeDistribution: Object.entries(decadeCount)
                    .sort(([a], [b]) => parseInt(a) - parseInt(b))
                    .map(([decade, count]) => ({ decade: `${decade}s`, count })),
                topYears: Object.entries(yearCount)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([year, count]) => ({ year: parseInt(year), count }))
            };
        } catch (error) {
            console.error('Error getting playlist statistics:', error);
            throw error;
        }
    }
}

module.exports = PlaylistSorter;
