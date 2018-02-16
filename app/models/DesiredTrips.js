/**
 * Model for an Desired trip to be stored in the database.
 */

// Requires.
let mongoose = require('mongoose')
let tripBase = require('./TripBase')

/**
 * Set up additional parameters for the Trip.
 */
let desiredTripSchema = tripBase({
  _creator: {type: String, ref: 'User', required: true},
  earliest: {type: Date},
  latest: {type: Date}
})

/**
 * Model the trip.
 */
let DesiredTrip = mongoose.model('DesiredTrip', desiredTripSchema)

// Exports.
module.exports = DesiredTrip
