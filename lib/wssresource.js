/**
 * Module to set up a websocket for
 * the user to connect to.
 * Socket does not accept messages and
 * only communicates with the one user.
 */

//Requires.
let WebSocketServer = require('websocket').server;
let config = require('../config/configs');
let connections = {};

/**
 * Sets up a WebSocketServer on top of the
 * server running.
 * @param httpserver {Server} the server to connect to.
 */
function connect(httpserver) {
    let wsserver = new WebSocketServer({
        httpServer: httpserver,
        autoAcceptConnections: false
    });

    wsserver.on('request', function (request) {
        let user = request.requestedProtocols[0];
        //only accept requests from our own site
        if (request.origin === config.siteurl) {
            //set up a new protocol for each connected user
            connections[user] = request.accept(user, request.origin);
        }
    });
}

/**
 * Returns a specific user's connection
 * for communication.
 * @param username {String} the user
 * @returns {connection} the connection for that user.
 */
function connection(username) {
    return connections[username];
}


//Exports.
module.exports = {
    connect: connect,
    connection: connection
};