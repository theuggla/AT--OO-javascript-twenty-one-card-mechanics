/**
 * Collect all configs.
 */


'use strict';

let path = require('path');
let _ = require('lodash');

// All configurations will extend these options
// ============================================
let all = {
    // Environment
    env: process.env.NODE_ENV,

    // Server port
    port: process.env.PORT || 8000,

    // Github Auth
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    hookSecret:  process.env.WEBHK_SECRET,
    username: 'theuggla'

};

// Export the config object based on the environment given
// ==============================================
module.exports = function() {
    let env = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';

    return _.merge(
        all,
        require('./environment/' + env + '.js') || {}
    );
}();