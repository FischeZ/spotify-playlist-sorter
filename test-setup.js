#!/usr/bin/env node

/**
 * Test setup for Spotify Playlist Sorter
 * Validates configuration and dependencies
 */

const fs = require('fs');
const path = require('path');

function checkFile(filePath, description) {
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${description}`);
        return true;
    } else {
        console.log(`❌ ${description}`);
        return false;
    }
}

function checkEnvVar(varName, description) {
    if (process.env[varName]) {
        console.log(`✅ ${description}: ${process.env[varName].substring(0, 10)}...`);
        return true;
    } else {
        console.log(`❌ ${description}: Not set`);
        return false;
    }
}

async function testSetup() {
    console.log('🧪 Testing Spotify Playlist Sorter Setup\n');

    let allGood = true;

    // Check files
    console.log('📁 Checking files:');
    allGood &= checkFile('package.json', 'package.json exists');
    allGood &= checkFile('.env', '.env file exists');
    allGood &= checkFile('src/index.js', 'Main application file exists');
    allGood &= checkFile('src/services/spotifyService.js', 'Spotify service exists');
    allGood &= checkFile('src/services/playlistSorter.js', 'Playlist sorter exists');
    allGood &= checkFile('node_modules', 'Dependencies installed');

    console.log('\n🔧 Checking environment variables:');
    
    // Load .env file
    if (fs.existsSync('.env')) {
        require('dotenv').config();
    }

    allGood &= checkEnvVar('SPOTIFY_CLIENT_ID', 'Spotify Client ID');
    allGood &= checkEnvVar('SPOTIFY_CLIENT_SECRET', 'Spotify Client Secret');
    allGood &= checkEnvVar('SPOTIFY_REDIRECT_URI', 'Spotify Redirect URI');

    console.log('\n📦 Checking dependencies:');
    try {
        require('express');
        console.log('✅ Express.js');
    } catch (e) {
        console.log('❌ Express.js');
        allGood = false;
    }

    try {
        require('spotify-web-api-node');
        console.log('✅ Spotify Web API Node');
    } catch (e) {
        console.log('❌ Spotify Web API Node');
        allGood = false;
    }

    try {
        require('dotenv');
        console.log('✅ dotenv');
    } catch (e) {
        console.log('❌ dotenv');
        allGood = false;
    }

    console.log('\n🎯 Testing configuration:');
    try {
        const config = require('./src/config/config');
        config.validate();
        console.log('✅ Configuration is valid');
    } catch (e) {
        console.log(`❌ Configuration error: ${e.message}`);
        allGood = false;
    }

    console.log('\n' + '='.repeat(50));
    if (allGood) {
        console.log('🎉 All tests passed! Your setup looks good.');
        console.log('\nYou can now start the application with:');
        console.log('   npm start     - Production mode');
        console.log('   npm run dev   - Development mode');
    } else {
        console.log('⚠️  Some issues found. Please check the errors above.');
        console.log('\nCommon fixes:');
        console.log('- Run "npm install" to install dependencies');
        console.log('- Copy "env.example" to ".env" and fill in your Spotify credentials');
        console.log('- Make sure all required files exist');
    }
}

testSetup().catch(console.error);
