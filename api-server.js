// Requires ---------------------------------------------------------------------------------------------------
let restify = require('restify')
let fs = require('fs')
let passport = require('passport')

let mw = require('./app/middleware/middleware')
let corsMiddleware = require('restify-cors-middleware')
let plugins = require('restify-plugins')
let opt = require('./app/middleware/optionsresponses')

let port = process.env.PORT || 8443
let db = require('./app/lib/db')
let auth = require('./app/lib/auth/passport-setup')

/*let authenticationRouter = require('./app/routes/auth')*/

// Config -----------------------------------------------------------------------------------------------------
require('dotenv').config()
db.connect()
auth.connect()

let httpServerOptions = {
  key: fs.readFileSync('./certs/sslkey.pem'),
  cert: fs.readFileSync('./certs/sslcert.pem'),
  passphrase: process.env.CERT_PASSPHRASE
}

let cors = corsMiddleware({
  preflightMaxAge: 5,
  origins: ['*']
})

// Declare server ---------------------------------------------------------------------------------------------
let server = restify.createServer({
  httpServerOptions: httpServerOptions,
  name: 'aircoach-api'
})

// Middleware -------------------------------------------------------------------------------------------------
// CORS
server.pre(cors.preflight)
server.use(cors.actual)

// Passport
server.use(passport.initialize())

server.use(mw.acceptJSON)

// Routes ------------------------------------------------------------------------------------------------------
server.opts('/', opt.safeResource)
server.get('/', (req, res) => {
  res.send('Success!')
})

server.get('/secret', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.send('Success! Get Secret!')
})

// Error handling ----------------------------------------------------------------------------------------------


// Server up ---------------------------------------------------------------------------------------------------
server.listen(port, () => { console.log('%s listening at %s', server.name, server.url) })
