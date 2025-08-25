import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiClient {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async getAuthUrl() {
    try {
      const response = await this.client.get('/auth-url');
      return response.data;
    } catch (error) {
      throw new Error('Failed to get authentication URL');
    }
  }

  async handleCallback(code) {
    try {
      const response = await this.client.post('/callback', { code });
      return response.data;
    } catch (error) {
      throw new Error('Authentication failed');
    }
  }

  // Playlist endpoints
  async getPlaylists() {
    try {
      const response = await this.client.get('/playlists');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch playlists');
    }
  }

  async sortPlaylist(playlistId) {
    try {
      const response = await this.client.post('/sort', { playlistId });
      return response.data;
    } catch (error) {
      throw new Error('Failed to sort playlist');
    }
  }

  async getPlaylistStats(playlistId) {
    try {
      const response = await this.client.get(`/playlist/${playlistId}/stats`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to get playlist statistics');
    }
  }

  // Auth status check
  async checkAuthStatus() {
    try {
      const response = await this.client.get('/auth-status');
      return response.data;
    } catch (error) {
      return { authenticated: false };
    }
  }
}

export default new ApiClient();
