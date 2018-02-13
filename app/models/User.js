/**
 * A User model for mongoose.
 */

let mongoose = require('mongoose')
let bcrypt = require('bcrypt-nodejs')
let Schema = mongoose.Schema

let UserSchema = new Schema({
  email: {
    type: String,
    unique: true,
    sparse: true,
    validate: {
      validator: function (value) {
        return (/.+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/).test(value)
      },
      message: 'email is not valid'
    }
  },
  password: String
})

UserSchema.pre('save', function (next) {
  bcrypt.hash(this.password, null, null, (err, hash) => {
    if (err) {
      next(err)
    } else {
      this.password = hash
      next(null, this)
    }
  })
})

  /**
   * Compares two passwords.
   * @param pass {string} the password to compare.
   * @returns {Promise}  that resolves
   * true if the password is correct
   * false if it is not correct
   * or rejects with an error.
   */
UserSchema.methods.comparePassword = function (pass) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(pass, this.password, (err, res) => {
      if (err) {
        reject(err)
      } else {
        resolve(res)
      }
    })
  })
}

mongoose.model('User', UserSchema)

module.exports = mongoose.model('User')
