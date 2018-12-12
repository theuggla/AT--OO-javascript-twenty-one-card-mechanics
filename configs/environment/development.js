/**
 * Development configs.
 */

//Requires.
let path = require('path');

//Exports.
module.exports = {
    // URLs
    dbpath: 'mongodb://localhost/issueAppDevDB',
    socket: 'ws://localhost:8000',
    hookurl: '',
    githubAuthCallback: 'http://localhost:8000/login/github/return',
    siteurl: 'http://localhost:8000',

    // Secrets
    cookiesecret: 'catsandspaghettiflyingthroughtheair',
};