/**
 * App runs and sets up a websocket
 * against the server, and manages ajax-calls
 * to handle issues and comments remotely.
 */

//Requires.
let Websocket = require('./WebSocket');
let IssueManager = require("./IssueManager.js");

//DOM


//connect to the socket
Websocket.connect('ws://localhost:8000/')
    .then((result) => {
        console.log('connected');
    })
    .catch((error) => {
        console.log(error);
    });

//set up event listeners

