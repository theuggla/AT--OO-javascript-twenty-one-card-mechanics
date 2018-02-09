/**
 * Server starting point.
 **/

// Requires
let express = require('express')
let bodyParser = require('body-parser')
require('dotenv').config()

let home = require('./routes/home')
let github = require('./routes/github')
let notifications = require('./routes/notifications')
let app = express()
let port = '5252'

// Middlewares------------------------------------------------------------------------------------------------------

// JSON support
app.use(bodyParser.json())

// HTML form data support
app.use(bodyParser.urlencoded({extended: true}))

// CORS
/*  app.use(corser.create({
  origins: [],
  simpleMethods: corser.simpleMethods.concat(['PUT', 'DELETE']),
  simpleRequestHeaders: corser.simpleRequestHeaders.concat(['Authorization'])
})) */

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  next()
})

// Routes----------------------------------------------------------------------------------------------------
app.use('/', home)
app.use('/notifications', notifications)
app.use('/github', github)

// Custom Error Responses-------------------------------------------------------------------------------------------------

// 400 >
app.use((req, res, next) => {
  res.status(302).redirect('/')
})

// 500
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({message: err.message})
})

// Start the server----------------------------------------------------------------------------------------------------
app.listen(port, () => {
  console.log('server up on port ' + port)
})
