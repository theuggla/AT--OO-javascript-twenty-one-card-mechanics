// Requires-----------------------------------------------------------------------------------------------------
let express = require('express')
let app = express()
let bodyParser = require('body-parser')
let axios = require('axios')
let fs = require('fs')

let port = 5353
let db = require('./lib/db')
let User = require('./models/user')
let jwt = require('./auth/jwt')

require('dotenv').config()

// Config-------------------------------------------------------------------------------------------------------

// Database connection
db.connect()

// Middleware---------------------------------------------------------------------------------------------------

// JWT verification.
app.use(jwt.validate())

// JSON support
app.use(bodyParser.json())

// Routes-------------------------------------------------------------------------------------------------------
app.put('/user', (req, res, next) => {
  User.findOneAndUpdate({
    user: req.user.user
  }, {user: req.user.user, accessToken: req.user.accessToken}, { upsert: true, new: true }, (err, response) => {
    if (err) {
      res.json({message: 'Error saving user to database'})
    } else {
      res.json(response.user)
    }
  })
})

app.get('/organizations', (req, res, next) => {
  console.log('recieved org get')
  axios({
    method: 'get',
    headers: {'Authorization': 'token ' + req.user.accessToken, 'Accept': 'application/json'},
    url: 'https://api.github.com/user/orgs'
  })
  .then((response) => {
    res.json(response.data)
  })
  .catch((error) => {
    console.log(error)
  })
})

// Start service-------------------------------------------------------------------------------------------------
app.listen(port, () => {
  console.log('Github service listening on port ' + port + '!')
})
