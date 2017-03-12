/**
 * Production configs.
 */


//Exports.
module.exports = {
    // URLs
    siteurl: 'https://178.62.99.126',
    socket: 'wss://178.62.99.126',
    hookurl: 'https://178.62.99.126',
    githubAuthCallback: 'https://178.62.99.126/login/github/return',

    //Mongo
    dbpath: 'mongodb://' + process.env.ADMIN_USERNAME + ':' + process.env.ADMIN_PASS + '@ds157799.mlab.com:57799/server-play',

    //Secrets
    cookiesecret: process.env.COOKIE_SECRET,

};
