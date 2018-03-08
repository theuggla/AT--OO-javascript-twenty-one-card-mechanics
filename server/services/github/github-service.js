/**
 * Starting point for the github service.
 */

// Requires-----------------------------------------------------------------------------------------------------
let express = require('express')
let app = express()
let bodyParser = require('body-parser')

let port = process.env.port || 5353
let db = require('./lib/db/connect')
let jwt = require('./middleware/auth/jwt')
let response = require('./middleware/response')

let user = require('./routes/routes/user-routes')
let organizations = require('./routes/routes/organization-routes')

require('dotenv').config()

// Config-------------------------------------------------------------------------------------------------------

// Database connection
db.connect()

// Middleware---------------------------------------------------------------------------------------------------

// JWT verification.
app.use(jwt.validate())

// JSON support
app.use(bodyParser.json())

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  next()
})

// Routes-------------------------------------------------------------------------------------------------------
app.use('/user', user.create())
app.use('/organizations', organizations.create())

// Respond to client
app.use(response())

// Custom Error Responses-------------------------------------------------------------------------------------------------

// 404
app.use((req, res, next) => {
  res.status(404).json({message: 'Resource not found.'})
})

// 500
app.use((err, req, res, next) => {
  console.log(err)
  let status = err.status || 500
  let message = err.message || 'Server failure'
  res.status(status).json({message: message})
})

// Start service-------------------------------------------------------------------------------------------------
app.listen(port, () => {
  console.log('Github service listening on port ' + port + '!')
})
