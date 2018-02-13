// Requires ---------------------------------------------------------------------------------------------------
let express = require('express')
let app = express()
let https = require('https')
let fs = require('fs')
let bodyParser = require('body-parser')
let passport = require('passport')

let port = process.env.PORT || 8443
let db = require('./app/lib/db')

let home = require('./app/routes/home')

// Config -----------------------------------------------------------------------------------------------------
require('dotenv').config()
db.connect()

let sslOptions = {
  key: fs.readFileSync('./certs/sslkey.pem'),
  cert: fs.readFileSync('./certs/sslcert.pem'),
  passphrase: process.env.CERT_PASSPHRASE
}

// Middleware --------------------------------------------------------------------------------------------------

// Passport
app.use(passport.initialize())

// JSON support
app.use(bodyParser.json())

// Routes ------------------------------------------------------------------------------------------------------
app.use('/', home)

// Custom Error Responses ---------------------------------------------------------------------------------------

// 400 >
app.use((req, res) => {
  res.status(400)
})

// 500
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({message: err.message})
})

// Server up ---------------------------------------------------------------------------------------------------
https.createServer(sslOptions, app).listen(port, () => { console.log('https up') })
