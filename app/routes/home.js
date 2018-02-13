/**
 * Router for the gateway-pages.
 */

// Requires.
let router = require('express').Router()
let User = require('../models/User')
let jwt = require('../lib/auth/jwt')

// Routes.
router.route('/')
  .get((req, res) => {
    res.json({message: 'API on main'})
  })

router.route('/signup')
  .get((req, res, next) => {
    // sign up through json, call next to log in
    new User({email: 'mopooy@gmail.com', password: 'othman'}).save()
    .then((user) => { console.log(user); res.json({message: 'User saved'}) })
    .catch((err) => { console.log('err'); console.log(err) })
  })

router.route('/login')
 .post((req, res, next) => {
   if (!(req.body.email && req.body.password)) {
     return next({message: 'No credentials provided for login'})
   }

   let email = req.body.email
   let password = req.body.password

   User.findOne({email: email})
    .then((user) => {
      if (!user) {
        return next({message: 'No such user found'})
      }
      return user.comparePassword(password.trim())
    })
    .then((isMatch) => {
      if (!isMatch) {
        return next({message: 'Incorrect credentials'})
      } else {
        return User.findOne({email: email})
      }
    })
    .then((user) => {
      let token = jwt.create({id: user._id})
      return res.json({message: 'ok', token: token})
    })
    .catch((err) => {
      return next({message: 'Error reading from database: ' + err.message})
    })
 })

// Exports.
module.exports = router
