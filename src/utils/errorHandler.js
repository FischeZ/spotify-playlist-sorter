const Logger = require('./logger');

/**
 * Centralized error handling utility
 */

class ErrorHandler {
    /**
     * Handle Spotify API errors
     */
    static handleSpotifyError(error) {
        Logger.error('Spotify API Error', {
            statusCode: error.statusCode,
            message: error.message,
            body: error.body
        });

        switch (error.statusCode) {
            case 401:
                return { 
                    userMessage: 'Authentication expired. Please log in again.',
                    shouldReauth: true 
                };
            case 403:
                return { 
                    userMessage: 'Insufficient permissions. Please check your Spotify app settings.',
                    shouldReauth: false 
                };
            case 404:
                return { 
                    userMessage: 'Playlist not found. It may have been deleted or made private.',
                    shouldReauth: false 
                };
            case 429:
                return { 
                    userMessage: 'Too many requests. Please wait a moment and try again.',
                    shouldReauth: false 
                };
            case 500:
            case 502:
            case 503:
                return { 
                    userMessage: 'Spotify service is temporarily unavailable. Please try again later.',
                    shouldReauth: false 
                };
            default:
                return { 
                    userMessage: 'An unexpected error occurred. Please try again.',
                    shouldReauth: false 
                };
        }
    }

    /**
     * Handle application errors
     */
    static handleAppError(error, context = '') {
        Logger.error(`Application Error${context ? ` (${context})` : ''}`, {
            message: error.message,
            stack: error.stack
        });

        return {
            userMessage: 'An application error occurred. Please try again or contact support.',
            shouldReauth: false
        };
    }

    /**
     * Create user-friendly error response
     */
    static createErrorResponse(error, context = '') {
        let errorInfo;

        if (error.statusCode) {
            // Spotify API error
            errorInfo = this.handleSpotifyError(error);
        } else {
            // Application error
            errorInfo = this.handleAppError(error, context);
        }

        return {
            success: false,
            error: errorInfo.userMessage,
            shouldReauth: errorInfo.shouldReauth,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Express error middleware
     */
    static middleware(error, req, res, next) {
        const errorResponse = this.createErrorResponse(error, `${req.method} ${req.path}`);
        
        // Determine status code
        let statusCode = 500;
        if (error.statusCode) {
            statusCode = error.statusCode;
        } else if (error.status) {
            statusCode = error.status;
        }

        res.status(statusCode).json(errorResponse);
    }
}

module.exports = ErrorHandler;
