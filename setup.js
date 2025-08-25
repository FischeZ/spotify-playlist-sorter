#!/usr/bin/env node

/**
 * Setup script for Spotify Playlist Sorter
 * Helps users configure the application
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function setup() {
    console.log('🎵 Welcome to Spotify Playlist Sorter Setup!\n');
    
    console.log('This script will help you configure your application.\n');
    console.log('First, you need to create a Spotify app:');
    console.log('1. Go to https://developer.spotify.com/dashboard/applications');
    console.log('2. Create a new app (or use existing one)');
    console.log('3. Add "http://localhost:3000/callback" to Redirect URIs');
    console.log('4. Note your Client ID and Client Secret\n');

    const clientId = await question('Enter your Spotify Client ID: ');
    const clientSecret = await question('Enter your Spotify Client Secret: ');
    const port = await question('Enter port number (default 3000): ') || '3000';
    const redirectUri = `http://localhost:${port}/callback`;

    // Create .env file
    const envContent = `# Spotify API Credentials
SPOTIFY_CLIENT_ID=${clientId}
SPOTIFY_CLIENT_SECRET=${clientSecret}
SPOTIFY_REDIRECT_URI=${redirectUri}

# Server Configuration
PORT=${port}
NODE_ENV=development
`;

    try {
        fs.writeFileSync('.env', envContent);
        console.log('\n✅ Created .env file successfully!');
        
        // Check if node_modules exists
        if (!fs.existsSync('node_modules')) {
            console.log('\n📦 Installing dependencies...');
            const { spawn } = require('child_process');
            
            const npm = spawn('npm', ['install'], { stdio: 'inherit' });
            
            npm.on('close', (code) => {
                if (code === 0) {
                    console.log('\n✅ Dependencies installed successfully!');
                    console.log('\n🚀 Setup complete! You can now run:');
                    console.log('   npm start     - Start the application');
                    console.log('   npm run dev   - Start in development mode');
                    console.log(`\nThen open http://localhost:${port} in your browser.`);
                } else {
                    console.log('\n❌ Error installing dependencies. Please run "npm install" manually.');
                }
                rl.close();
            });
        } else {
            console.log('\n🚀 Setup complete! You can now run:');
            console.log('   npm start     - Start the application');
            console.log('   npm run dev   - Start in development mode');
            console.log(`\nThen open http://localhost:${port} in your browser.`);
            rl.close();
        }
        
    } catch (error) {
        console.error('\n❌ Error creating .env file:', error.message);
        rl.close();
    }
}

// Validate environment
if (fs.existsSync('.env')) {
    console.log('⚠️  .env file already exists. Do you want to overwrite it? (y/N)');
    question('').then((answer) => {
        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
            setup();
        } else {
            console.log('Setup cancelled.');
            rl.close();
        }
    });
} else {
    setup();
}
