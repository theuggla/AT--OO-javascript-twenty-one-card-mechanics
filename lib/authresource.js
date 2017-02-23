/**
 * Module to authenticate the user through github
 * with the passport module
 * get permission to make requests against github
 * and save the user into the site's database.
 */

//Requires.
let passport = require('passport');
let Strategy = require('passport-github').Strategy;
let User = require('../models/User');
let userdb = require('./userresource');
let config = require('../config/configs');


/**
 * Initialize the authentication and set up the handling
 * against the database.
 */
function connect() {
    //set up the authentication through github
    passport.use(new Strategy({
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: config.githubAuthCallback
        },

        function(accessToken, refreshToken, profile, done) {
            //set the access token to continue authenticating requests through the users github account
            process.env.ACCESS_TOKEN = accessToken;

            //finds or adds the user to the database
            userdb.findOrAdd(profile)
                .then((user) => {
                    return done(null, user);
                })
                .catch((error) => {
                    return done(error);
                });
        }));


    //The users github id is used to save in the session.
    passport.serializeUser((user, done) => {
        done(null, user.githubid);
    });

    //The users github id is used to then retrieve the user from the database.
    passport.deserializeUser((userid, done) => {
        User.find({githubid: userid})
            .then((user) => {
                done(null, user[0]);
            })
            .catch((error) => {
                done(error);
            });
    });
}

//Exports.
module.exports = {
    connect: connect
};
