/*
* Handler for auth-pages.
*/

// Requires
let User = require('../../models/User')
let jwt = require('../../lib/auth/jwt')

module.exports.login = function (req, res, next) {
  if (!(req.body.email && req.body.password)) {
    return res.send(400, {message: 'No credentials provided for login'})
  }

  let email = req.body.email
  let password = req.body.password

  User.findOne({email: email})
  .then((user) => {
    if (!user) {
      return res.send(401, {message: 'No such user found'})
    }
    return user.comparePassword(password.trim())
  })
  .then((isMatch) => {
    if (!isMatch) {
      return res.send(401, {message: 'Incorrect credentials'})
    } else {
      return User.findOne({email: email})
    }
  })
  .then((user) => {
    let token = jwt.create({id: user._id})
    return res.send(200, {message: 'Logged in', token: token})
  })
  .catch((err) => {
    return res.send(503, {message: 'Error reading from database: ' + err.message})
  })
}
