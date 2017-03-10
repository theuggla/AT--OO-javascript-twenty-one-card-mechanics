/**
 * A module to set up and handle the database.
 */


let mongoose = require('mongoose');
let config = require('../config/configs');
let session = require('express-session');
let mongoStore = require('connect-mongo')(session);

let isConnected = true;

/**
 * Connects to the database.
 */

function connect() {
    let db = mongoose.connection;

    // Use native promises
    mongoose.Promise = Promise;

    db.on('error', () => {
        isConnected = false;
    });

    db.once('open', () => {
        console.log('database is connected');
        isConnected = true;
    });

    // Close database connection if node process closes.
    process.on("SIGINT", function() {
        db.close(function () {
            console.log('database disconnected');
            process.exit(0);
        });
    });

    //Connect to the database
    mongoose.connect(config.dbpath);
}

/**
 * Sets up a session store to use with express-sessions.
 */
function sessionStore() {
    return new mongoStore({mongooseConnection: mongoose.connection});
}

//Exports.
module.exports = {
    connect: connect,
    isConnected: isConnected,
    sessionStore: sessionStore
};
