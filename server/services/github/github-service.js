// Requires-----------------------------------------------------------------------------------------------------
let express = require('express')
let app = express()
let bodyParser = require('body-parser')
let axios = require('axios')

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
  console.log('in /user')
  User.findOneAndUpdate({user: req.user.user}, {user: req.user.user, accessToken: req.user.accessToken}, { upsert: true, new: true },
  (err, result) => {
    if (err) {
      return res.json({message: 'Error saving user to database'})
    } else {
      return res.json(result.user)
    }
  })
})

app.get('/organizations', (req, res, next) => {
  console.log('in /organizations')
  axios({
    method: 'get',
    headers: {'Authorization': 'token ' + req.user.accessToken, 'Accept': 'application/json'},
    url: 'https://api.github.com/user/memberships/orgs'
  })
  .then((response) => {
    return response.data.filter((organization) => {
      return organization.role === 'admin'
    })
  })
  .then((adminOrgs) => {
    return res.json(adminOrgs.map((org) => { return org.organization }))
  })
  .catch((error) => {
    console.log(error)
  })
})

app.put('/organizations/hooks/:id', (req, res, next) => {
  axios({
    method: 'GET',
    headers: {'Authorization': 'token ' + req.user.accessToken, 'Accept': 'application/json'},
    url: 'https://api.github.com/orgs/' + req.params.id + '/hooks'
  })
  .then((response) => {
    console.log(response.data)
    let exists = response.data.find((hook) => {
      return hook.config.url === req.body.callback
    })

    if (!exists) {
      return axios({
        method: 'POST',
        headers: {'Authorization': 'token ' + req.user.accessToken, 'Accept': 'application/json'},
        url: 'https://api.github.com/orgs/' + req.params.id + '/hooks',
        data: {
          'name': 'web',
          'events': [
            'push',
            'repository',
            'release'
          ],
          'config': {
            'url': req.body.callback,
            'content_type': 'json'
          }
        }
      })
    } else {
      return axios({
        method: 'POST',
        headers: {'Authorization': 'token ' + req.user.accessToken, 'Accept': 'application/json'},
        url: 'https://api.github.com/orgs/' + req.params.id + '/hooks/23314457/pings'
      })
    }
  })
  .then(() => {
    res.sendStatus(201)
  })
  .catch((error) => {
    return next(error)
  })
})

// Custom Error Responses-------------------------------------------------------------------------------------------------

// 500
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({message: err.message})
})

// Start service-------------------------------------------------------------------------------------------------
app.listen(port, () => {
  console.log('Github service listening on port ' + port + '!')
})
