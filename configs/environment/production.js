/**
 * Production configs.
 */


//Exports.
module.exports = {
    // URLs
    siteurl: 'https://178.62.99.126',
    socket: 'wss://178.62.99.126',
    hookurl: this.siteurl,
    githubAuthCallback: this.siteurl + '/login/github/return',

    //Mongo
    dbpath: 'mongodb://theuggla:crumcrum22@ds157799.mlab.com:57799/server-play',

    //Secrets
    cookiesecret: process.env.COOKIE_SECRET,

};
