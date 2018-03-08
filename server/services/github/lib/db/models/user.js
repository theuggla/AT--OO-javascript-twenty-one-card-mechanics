var mongoose = require('mongoose')

let Schema = mongoose.Schema

let UserSchema = new Schema(
  {
    user: {type: String, required: true, unique: true},
    accessToken: {type: String, required: true},
    latestEventPoll: {type: String}
  }
)

// Exports.
module.exports = mongoose.model('User', UserSchema)
