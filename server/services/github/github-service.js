// Requires-----------------------------------------------------------------------------------------------------
let express = require('express')
let app = express()
let bodyParser = require('body-parser')
let jwt = require('express-jwt')
let axios = require('axios')

let port = 5353
let serviceName = process.env.SERVICE_NAME
let db = require('./lib/db')
let User = require('./models/user')
require('dotenv').config()

// Config-------------------------------------------------------------------------------------------------------
// Database connection
db.connect()

// JSON support
app.use(bodyParser.json())

// Routes-------------------------------------------------------------------------------------------------------
app.get('/', (req, res) => {
  res.json({message: 'Hello World! I am ' + serviceName + '!'})
})

app.put('/user', jwt({secret: process.env.JWT_SECRET}), (req, res) => {
  console.log('recieved user put')
  User.findOneAndUpdate({
    user: req.user.user
  }, {user: req.user.user, accessToken: req.user.accessToken}, { upsert: true, new: true }, (err, response) => {
    if (err) {
      console.log(err)
      res.json({message: 'Error saving user to database'})
    } else {
      res.json(response.data)
    }
  })
})

app.get('/organizations', jwt({secret: process.env.JWT_SECRET}), (req, res) => {
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
