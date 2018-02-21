/**
 * A Trips model for mongoose, to be extended by Planned and Desired trips.
 */

let mongoose = require('mongoose')
let Schema = mongoose.Schema

module.exports = function (paths) {
  let schema = new Schema({
    _creator: {type: String, ref: 'User', required: true},
    from: {type: String},
    to: {type: String}
  })

  schema.add(paths)

  return schema
}
