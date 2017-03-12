/**
 * Production configs.
 */


//Exports.
module.exports = {
    // URLs
    siteurl: 'https://178.62.99.126',
    socket: 'wss://178.62.99.126',
    secureSocket: 'ws://178.62.99.126',
    hookurl: 'https://178.62.99.126',
    githubAuthCallback: 'https://178.62.99.126/login/github/return',

    //Mongo
    dbpath: 'mongodb://' + process.env.ADMIN_USERNAME + ':' + process.env.ADMIN_PASS + '@ds019806.mlab.com:19806/issue-app-db',

    //Secrets
    cookiesecret: process.env.COOKIE_SECRET,
};
