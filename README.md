# 🎵 Spotify Playlist Sorter

A modern full-stack web application built with React (Vite) and Node.js that sorts your Spotify playlists by release date using the Spotify Web API. Organize your music chronologically with a beautiful, responsive interface!

## ✨ Features

- **Modern React Frontend**: Built with React 18 and Vite for lightning-fast development and performance
- **OAuth Authentication**: Secure login with your Spotify account
- **Playlist Selection**: Choose from all your playlists (both public and private)
- **Release Date Sorting**: Automatically sort tracks from oldest to newest release date
- **Smart Date Handling**: Handles different date precisions (year, month, day)
- **Beautiful Web Interface**: Clean, responsive design with Spotify-inspired dark theme
- **RESTful API**: Clean separation between frontend and backend
- **Real-time Feedback**: See sorting progress and results immediately
- **Batch Processing**: Efficiently handles playlists of any size

## 🚀 Quick Start

### Prerequisites

- Node.js (version 16 or higher)
- npm (comes with Node.js)
- A Spotify account
- Spotify Developer App credentials

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd spotify-playlist-sorter
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Spotify API Credentials

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/applications)
2. Create a new app or use an existing one
3. Note your **Client ID** and **Client Secret**
4. Add `http://localhost:3000/callback` to your app's Redirect URIs

### 4. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` and add your Spotify credentials:
   ```env
   SPOTIFY_CLIENT_ID=your_client_id_here
   SPOTIFY_CLIENT_SECRET=your_client_secret_here
   SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
   PORT=3000
   ```

### 5. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies (this happens automatically via postinstall)
# Or manually: npm run frontend:install
```

### 6. Run the Application

#### Development Mode (Recommended)
```bash
# Run both backend and frontend in development mode
npm run dev:full
```

This will start:
- Backend API server on `http://localhost:3000`
- Frontend development server on `http://localhost:5173`

#### Individual Services
```bash
# Backend only
npm run dev

# Frontend only
npm run frontend:dev
```

#### Production Mode
```bash
# Build frontend for production
npm run build

# Start backend server (serves API only)
npm start
```

### 7. Use the Application

1. Open your browser and go to `http://localhost:5173` (development) 
2. Click "Connect to Spotify" to authenticate
3. Select a playlist from your library
4. Click "Sort by Release Date" and watch the magic happen!

## 📖 How It Works

### Sorting Algorithm

The application sorts tracks by their album release dates using the following logic:

1. **Date Parsing**: Handles different precision levels from Spotify:
   - `day`: Full date (e.g., "2023-03-15")
   - `month`: Year and month (e.g., "2023-03")
   - `year`: Year only (e.g., "2023")

2. **Sorting Order**: Tracks are sorted from oldest to newest release date

3. **Missing Dates**: Tracks without release dates are placed at the end

4. **Playlist Update**: The original playlist is updated with the new track order

### API Integration

- Uses the `spotify-web-api-node` library for clean API interactions
- Implements OAuth 2.0 flow for secure authentication
- Handles token refresh automatically
- Respects Spotify API rate limits with proper error handling

## 🛠️ Development

### Project Structure

```
spotify-playlist-sorter/
├── frontend/                    # React frontend (Vite)
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API client
│   │   ├── App.jsx           # Main App component
│   │   └── main.jsx          # Entry point
│   ├── public/               # Static assets
│   ├── package.json         # Frontend dependencies
│   └── vite.config.js       # Vite configuration
├── src/                     # Backend API (Node.js/Express)
│   ├── index.js            # Main API server
│   ├── config/            # Configuration files
│   ├── services/          # Business logic
│   │   ├── spotifyService.js  # Spotify API integration
│   │   └── playlistSorter.js  # Sorting logic
│   └── utils/             # Utility functions
├── package.json           # Backend dependencies & scripts
├── .env.example          # Environment variables template
└── README.md
```

### Available Scripts

#### Full-Stack Development
- `npm run dev:full` - Run both backend and frontend in development mode
- `npm run build` - Build frontend for production

#### Backend Scripts
- `npm start` - Run the backend API server in production mode
- `npm run dev` - Run backend with nodemon for development
- `npm test` - Run tests (placeholder)

#### Frontend Scripts
- `npm run frontend:dev` - Run frontend development server
- `npm run frontend:build` - Build frontend for production
- `npm run frontend:install` - Install frontend dependencies

### Adding New Features

The application is designed to be easily extensible:

1. **New Sorting Methods**: Add methods to `PlaylistSorter` class in `src/services/playlistSorter.js`
2. **Additional API Endpoints**: Extend routes in `src/index.js`
3. **Enhanced UI**: Add new React components in `frontend/src/components/`
4. **New Pages**: Create new page components in `frontend/src/pages/`
5. **API Integration**: Extend the API client in `frontend/src/services/apiClient.js`
6. **Database Integration**: Add persistence for user preferences

### Technology Stack

**Frontend:**
- React 18 with hooks
- Vite for build tooling
- React Router for navigation
- Axios for API calls
- Modern CSS with Spotify-inspired design

**Backend:**
- Node.js with Express
- Spotify Web API integration
- CORS enabled for cross-origin requests
- RESTful API design

## 🔧 Configuration Options

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SPOTIFY_CLIENT_ID` | Your Spotify app's Client ID | Required |
| `SPOTIFY_CLIENT_SECRET` | Your Spotify app's Client Secret | Required |
| `SPOTIFY_REDIRECT_URI` | OAuth redirect URI | `http://localhost:3000/callback` |
| `PORT` | Backend server port | `3000` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `NODE_ENV` | Environment mode | `production` |

**Frontend Environment Variables** (in `frontend/.env`):
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:3000/api` |

### Spotify API Scopes

The application requests the following permissions:
- `user-read-private` - Access user profile
- `user-read-email` - Access user email
- `playlist-read-private` - Read private playlists
- `playlist-read-collaborative` - Read collaborative playlists
- `playlist-modify-private` - Modify private playlists
- `playlist-modify-public` - Modify public playlists

## 🐛 Troubleshooting

### Common Issues

1. **"Authentication failed"**
   - Check your Client ID and Client Secret
   - Ensure the redirect URI matches exactly
   - Verify your Spotify app settings

2. **"Failed to get playlists"**
   - Make sure you've granted the necessary permissions
   - Try re-authenticating with Spotify

3. **"Error sorting playlist"**
   - Ensure the playlist isn't empty
   - Check that you have edit permissions for the playlist
   - Some playlists may contain tracks that are no longer available

### Debug Mode

Add this to your `.env` file for more detailed logging:
```env
NODE_ENV=development
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- [Spotify Web API](https://developer.spotify.com/documentation/web-api/) for the amazing music data
- [spotify-web-api-node](https://github.com/thelinmichael/spotify-web-api-node) for the excellent Node.js wrapper
- The Spotify team for creating such a comprehensive API

## 📞 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Search existing issues in the repository
3. Create a new issue with detailed information about your problem

---

Made with ❤️ for music lovers who appreciate chronological organization!
