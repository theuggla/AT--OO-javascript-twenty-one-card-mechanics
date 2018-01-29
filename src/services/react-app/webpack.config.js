// Get the right config
module.exports = (process.env.NODE_ENV === 'production'
? require('./config/webpack.config.production.js')
: require('./config/webpack.config.base.js'))
