// Requires-----------------------------------------------------------------------------------------------------
let express = require('express')
let app = express()
let bodyParser = require('body-parser')
let port = 5252
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

app.put('/user', (req, res) => {
  User.findOneAndUpdate({
    user: req.body.user
  }, {user: req.body.user, accessToken: req.body.accessToken}, { upsert: true, new: true }, (err, response) => {
    if (err) res.json({message: 'Error saving user to database'})
    res.json(response.user)
  })
})

// Start service-------------------------------------------------------------------------------------------------
app.listen(port, () => {
  console.log('Github service listening on port ' + port + '!')
})
