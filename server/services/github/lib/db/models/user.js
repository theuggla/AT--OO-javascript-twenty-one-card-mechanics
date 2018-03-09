var mongoose = require('mongoose')

let Schema = mongoose.Schema

let UserSchema = new Schema(
  {
    user: {type: String, required: true, unique: true},
    accessToken: {type: String, required: true},
    poll: {
      latestETag: {type: String},
      atTime: {type: Date}
    }
  }
)

// Exports.
module.exports = mongoose.model('User', UserSchema)
