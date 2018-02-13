// Requires ---------------------------------------------------------------------------------------------------
let express = require('express')
let https = require('https')
let fs = require('fs')

let home = require('./app/routes/home')

// Config -----------------------------------------------------------------------------------------------------
require('dotenv').config()

let sslOptions = {
  key: fs.readFileSync('./certs/key.pem'),
  cert: fs.readFileSync('./certs/cert.pem'),
  passphrase: process.env.CERT_PASSPHRASE
}

let app = express()

// Middleware --------------------------------------------------------------------------------------------------

// Routes ------------------------------------------------------------------------------------------------------
app.use('/', home)

// Server up ---------------------------------------------------------------------------------------------------
https.createServer(sslOptions, app).listen(8443, () => { console.log('https up') })
