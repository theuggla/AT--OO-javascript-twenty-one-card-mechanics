var mongoose = require('mongoose')

let Schema = mongoose.Schema

let UserSchema = new Schema(
  {
    username: {type: String, required: true},
    accessToken: {type: String, required: true},
    latestEventPoll: {type: String}
  }
)

// Exports.
module.exports = mongoose.model('User', UserSchema)
