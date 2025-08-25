/**
 * Simple logging utility
 */

class Logger {
    static log(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        
        console.log(logMessage);
        
        if (data) {
            console.log('Data:', data);
        }
    }

    static info(message, data = null) {
        this.log('info', message, data);
    }

    static error(message, data = null) {
        this.log('error', message, data);
    }

    static warn(message, data = null) {
        this.log('warn', message, data);
    }

    static debug(message, data = null) {
        if (process.env.NODE_ENV === 'development') {
            this.log('debug', message, data);
        }
    }
}

module.exports = Logger;
