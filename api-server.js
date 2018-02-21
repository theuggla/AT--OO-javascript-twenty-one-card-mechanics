// Requires ---------------------------------------------------------------------------------------------------
let restify = require('restify')
let fs = require('fs')
let passport = require('passport')

// middleware
let mw = require('./app/middleware/middleware')
let corsMiddleware = require('restify-cors-middleware')
let plugins = require('restify-plugins')

let resources = require('./app/lib/resources')

// routers
let baseRouter = require('./app/routes/routers/baseRouter')
let authenticationRouter = require('./app/routes/routers/authenticationRouter')
let userRouter = require('./app/routes/routers/userRouter')

// variables
let port = process.env.PORT || 8443
let db = require('./app/lib/db/db-connector')
let auth = require('./app/lib/auth/passport-setup')

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

// JSON
server.use(mw.acceptJSON)
server.use(plugins.jsonBodyParser())

// Routes ------------------------------------------------------------------------------------------------------
baseRouter.applyRoutes(server)
authenticationRouter.applyRoutes(server)
userRouter.applyRoutes(server)

// Initialize resources
resources(server)

// Error handling ----------------------------------------------------------------------------------------------

// Server up ---------------------------------------------------------------------------------------------------
server.listen(port, () => { console.log('%s listening at %s', server.name, server.url) })
